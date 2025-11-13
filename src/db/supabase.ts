import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const supabase = createClient(config.supabase.url, config.supabase.key);

export interface Doctor {
  id: string;
  name: string;
  clinic_id: string;
  specialty: string;
  available: boolean;
}

export interface Schedule {
  id: string;
  doctor_id: string;
  date: string;
  time_slots: any;
  status: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_name: string;
  doctor_id: string;
  clinic_id: string;
  date: string;
  time_slot: string;
  status: string;
  created_at: string;
}

export async function getDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase.from('doctors').select('*').eq('available', true);
  if (error) throw error;
  return data || [];
}

export async function getSchedule(doctorId: string, date: string): Promise<Schedule | null> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('date', date)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
  const { data, error } = await supabase.from('appointments').insert([appointment]).select().single();
  if (error) throw error;
  return data;
}

export async function updateScheduleStatus(doctorId: string, date: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('doctor_id', doctorId)
    .eq('date', date);
  if (error) throw error;
}
