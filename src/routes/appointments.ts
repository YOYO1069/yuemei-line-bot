import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

/**
 * GET /api/doctors
 * 取得所有醫師列表
 */
router.get('/doctors', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      doctors: data || [],
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      error: '無法取得醫師列表',
    });
  }
});

/**
 * GET /api/schedules
 * 取得醫師排班資訊
 * Query params: doctor_id, date
 */
router.get('/schedules', async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    let query = supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: true });

    if (doctor_id) {
      query = query.eq('doctor_id', doctor_id);
    }

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      schedules: data || [],
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      error: '無法取得排班資訊',
    });
  }
});

/**
 * POST /api/appointments
 * 建立新預約
 */
router.post('/appointments', async (req, res) => {
  try {
    const {
      line_user_id,
      line_display_name,
      patient_name,
      patient_phone,
      doctor_id,
      appointment_date,
      appointment_time,
      notes,
    } = req.body;

    // 驗證必填欄位
    if (!line_user_id || !patient_name || !patient_phone || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: '缺少必填欄位',
      });
    }

    // 檢查時段是否已被預約
    const { data: existingAppointments, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .neq('status', 'cancelled');

    if (checkError) throw checkError;

    if (existingAppointments && existingAppointments.length > 0) {
      return res.status(409).json({
        success: false,
        error: '此時段已被預約',
      });
    }

    // 建立預約
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        line_user_id,
        line_display_name,
        patient_name,
        patient_phone,
        doctor_id,
        appointment_date,
        appointment_time,
        notes,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      appointment,
      message: '預約成功！',
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: '預約失敗，請稍後再試',
    });
  }
});

/**
 * GET /api/appointments/:lineUserId
 * 取得使用者的預約記錄
 */
router.get('/appointments/:lineUserId', async (req, res) => {
  try {
    const { lineUserId } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors (
          name,
          specialty,
          photo_url
        )
      `)
      .eq('line_user_id', lineUserId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      appointments: data || [],
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: '無法取得預約記錄',
    });
  }
});

/**
 * PATCH /api/appointments/:id/cancel
 * 取消預約
 */
router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { line_user_id } = req.body;

    if (!line_user_id) {
      return res.status(400).json({
        success: false,
        error: '缺少使用者資訊',
      });
    }

    // 驗證預約是否屬於該使用者
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('line_user_id', line_user_id)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({
        success: false,
        error: '找不到預約記錄',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: '此預約已被取消',
      });
    }

    // 取消預約
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: '預約已取消',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: '取消預約失敗',
    });
  }
});

export default router;
