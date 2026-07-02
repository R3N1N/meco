import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Calendar as CalendarIcon, Clock, MapPin, User, Mail, Phone, FileText, CheckCircle2, ChevronRight, Loader } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapInput from '../components/MapInput';

const BookAppointment = () => {
  const { user } = useAuth();

  // Wizards state
  const [apptType, setApptType] = useState('clinic'); // clinic, home
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Submit state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      guest_name: user?.name || '',
      guest_email: user?.email || '',
      guest_phone: user?.phone || '',
      appointment_type: 'clinic',
      notes: '',
      mapLocation: { address: '', latitude: 27.7172, longitude: 85.3240 }
    }
  });

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDocs(true);
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to load doctors', err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch available slots when parameters change
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    if (apptType === 'clinic' && !selectedDoc) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const params = {
          type: apptType,
          date: selectedDate,
          ...(apptType === 'clinic' && { doctor_id: selectedDoc })
        };
        const res = await API.get('/appointments/slots', { params });
        setSlots(res.data);
      } catch (err) {
        console.error('Failed to load slots', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [apptType, selectedDoc, selectedDate]);

  // Handle Type toggle
  const handleTypeChange = (type) => {
    setApptType(type);
    setValue('appointment_type', type);
    setSelectedDate('');
    setSlots([]);
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        appointment_type: apptType,
        appointment_date: selectedDate,
        appointment_time: data.appointment_time,
        notes: data.notes,
        // If not logged in, pass guest details
        ...(!user && {
          guest_name: data.guest_name,
          guest_email: data.guest_email,
          guest_phone: data.guest_phone,
        }),
        // Clinic details
        ...(apptType === 'clinic' && {
          doctor_id: selectedDoc,
          slot_id: data.slot_id
        }),
        // Home details
        ...(apptType === 'home' && {
          address: data.mapLocation.address,
          latitude: data.mapLocation.latitude,
          longitude: data.mapLocation.longitude
        })
      };

      const res = await API.post('/appointments', payload);
      setConfirmedBooking(res.data.booking);
      setBookingSuccess(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Booking transaction failed. Try choosing a different slot.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Confirmation Page
  if (bookingSuccess && confirmedBooking) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4">
        <div className="glass border border-slate-800 rounded-3xl p-8 text-center flex flex-col gap-6 items-center">
          <div className="w-16 h-16 bg-teal-950/60 border border-teal-800/40 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/15">
            <CheckCircle2 className="w-10 h-10 text-teal-400" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Booking Confirmed!</h2>
            <p className="text-xs text-black mt-1">Your appointment has been reserved successfully</p>
          </div>

          <div className="w-full bg-navy-950 border border-slate-900 rounded-2xl p-5 text-left flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <span className="text-xs text-black">Appointment Type</span>
              <span className="text-xs font-bold text-black uppercase tracking-widest">{confirmedBooking.appointment_type} Visit</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-black uppercase font-semibold">Date</span>
                <span className="text-xs font-bold text-black">{new Date(confirmedBooking.appointment_date).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-black uppercase font-semibold">Time</span>
                <span className="text-xs font-bold text-black">{confirmedBooking.appointment_time}</span>
              </div>
            </div>

            {confirmedBooking.appointment_type === 'clinic' ? (
              <div className="flex flex-col gap-0.5 border-t border-slate-900 pt-3">
                <span className="text-[10px] text-black uppercase font-semibold">Assigned Practitioner</span>
                <span className="text-xs font-bold text-black">{confirmedBooking.doctor_name || 'Assigned Doctor'}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 border-t border-slate-900 pt-3">
                <span className="text-[10px] text-black uppercase font-semibold">Home Service Address</span>
                <span className="text-xs text-black leading-relaxed leading-tight">{confirmedBooking.address}</span>
              </div>
            )}

            {!user && (
              <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                <span className="text-[10px] text-black uppercase font-semibold">Guest Contact Details</span>
                <div className="text-[11px] text-black leading-none flex flex-col gap-1">
                  <span>Name: {confirmedBooking.guest_name}</span>
                  <span>Email: {confirmedBooking.guest_email}</span>
                  <span>Phone: {confirmedBooking.guest_phone}</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-normal max-w-sm">
            {user
              ? 'You can view and manage this booking directly from your patient dashboard appointments panel.'
              : 'Please write down or screenshot this booking information. Since you booked as a guest, you will not have access to dashboard panels.'
            }
          </p>

          <button
            onClick={() => {
              setBookingSuccess(false);
              setConfirmedBooking(null);
              setSelectedDate('');
              setSlots([]);
            }}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
          >
            Book Another Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-black text-center">Schedule Eye Care Services</h1>
        <p className="text-xs text-slate-400 text-center mt-1">Book visual checkups dynamically in minutes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Toggle & Details Panel */}
        <div className="lg:col-span-1 glass rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Service Type</h3>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleTypeChange('clinic')}
              className={`p-4 border rounded-xl text-left flex flex-col gap-1 transition-all ${apptType === 'clinic'
                ? 'bg-teal-600/15 border-teal-500 text-teal-400'
                : 'bg-navy-950 border-slate-800 hover:bg-navy-900 text-slate-350'
                }`}
            >
              <span className="text-xs font-bold">In-Clinic Consult</span>
              <span className="text-[10px] text-white leading-normal">
                Visit our office for tests with advanced diagnostic machinery.
              </span>
            </button>

            <button
              onClick={() => handleTypeChange('home')}
              className={`p-4 border rounded-xl text-left flex flex-col gap-1 transition-all ${apptType === 'home'
                ? 'bg-teal-600/15 border-teal-500 text-teal-400'
                : 'bg-navy-950 border-slate-800 hover:bg-navy-900 text-slate-350'
                }`}
            >
              <span className="text-xs font-bold">Home Service Visit</span>
              <span className="text-[10px] text-white leading-normal">
                A visual examiner travels to your pinned location. (10 AM - 6 PM)
              </span>
            </button>
          </div>
        </div>

        {/* Booking Form Wizard */}
        <div className="lg:col-span-2 glass rounded-2xl p-8 border border-slate-800">
          {submitError && (
            <div className="bg-red-950/35 border border-red-900/45 text-red-400 text-xs px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <span className="font-semibold">{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

            {/* Step: User details (only if guest) */}
            {!user && (
              <div className="flex flex-col gap-4 border-b border-slate-800 pb-6">
                <h4 className="text-xs font-bold text-teal-450 uppercase tracking-widest mb-1">Guest Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="John Doe"
                        className={`w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2 border text-xs focus:outline-none focus:border-teal-500 ${errors.guest_name ? 'border-red-500/50' : 'border-slate-800'}`}
                        {...register('guest_name', { required: 'Name is required for guest bookings' })}
                      />
                      <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                    {errors.guest_name && <span className="text-red-400 text-[10px]">{errors.guest_name.message}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className={`w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2 border text-xs focus:outline-none focus:border-teal-500 ${errors.guest_email ? 'border-red-500/50' : 'border-slate-800'}`}
                        {...register('guest_email', {
                          required: 'Email is required for guest bookings',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                        })}
                      />
                      <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                    {errors.guest_email && <span className="text-red-400 text-[10px]">{errors.guest_email.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white">Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="555-0102"
                      className={`w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2 border text-xs focus:outline-none focus:border-teal-500 ${errors.guest_phone ? 'border-red-500/50' : 'border-slate-800'}`}
                      {...register('guest_phone', { required: 'Phone number is required' })}
                    />
                    <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                  {errors.guest_phone && <span className="text-red-400 text-[10px]">{errors.guest_phone.message}</span>}
                </div>
              </div>
            )}

            {/* Doctor Selection (Only Clinic) */}
            {apptType === 'clinic' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white">Select Eye Care Doctor</label>
                {loadingDocs ? (
                  <span className="text-xs text-slate-500">Loading specialist registry...</span>
                ) : (
                  <select
                    value={selectedDoc}
                    onChange={(e) => {
                      setSelectedDoc(e.target.value);
                      setSelectedDate('');
                      setSlots([]);
                    }}
                    className="w-full bg-navy-950 text-slate-300 rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                  >

                    <option value="">-- Select practitioner --</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id} value={doc.doctor_id} className="text-black">
                        {doc.name} - {doc.specialization}
                      </option>
                    ))}

                  </select>
                )}
              </div>
            )}

            {/* Date Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Select Date</label>
              <div className="relative">
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setValue('appointment_time', '');
                  }}
                  disabled={apptType === 'clinic' && !selectedDoc}
                  className="w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2 border border-slate-800 text-xs focus:outline-none focus:border-teal-500 disabled:opacity-40"
                />
                <CalendarIcon className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Time Slot Picker */}
            {selectedDate && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white flex items-center gap-1">
                  <Clock className="w-4 h-4 text-black" /> Select Available Time Slot
                </label>

                {loadingSlots ? (
                  <div className="py-4 text-center text-xs text-slate-500 flex justify-center items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-teal-400" /> Checking slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-4 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    No schedules available for this day. Try another date or doctor.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                    {slots.map((slot) => {
                      const isClinic = apptType === 'clinic';
                      const timeVal = isClinic ? slot.start_time : slot.time;
                      const isBooked = isClinic ? (slot.is_booked === 1 || slot.is_booked === true) : slot.is_booked;
                      const slotIdentifier = isClinic ? slot.id : timeVal;

                      const currentSelect = isClinic ? watch('slot_id') : watch('appointment_time');
                      const active = String(currentSelect) === String(slotIdentifier);

                      return (
                        <button
                          key={slotIdentifier}
                          type="button"
                          disabled={isBooked}
                          onClick={() => {
                            if (isClinic) {
                              setValue('slot_id', slotIdentifier);
                              setValue('appointment_time', timeVal);
                            } else {
                              setValue('appointment_time', timeVal);
                            }
                          }}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${isBooked
                            ? 'bg-navy-950 border-slate-900 text-slate-600 line-through cursor-not-allowed'
                            : active
                              ? 'bg-teal-600 border-teal-500 text-white'
                              : 'bg-navy-950 border-slate-800 hover:bg-navy-900 text-slate-300'
                            }`}
                        >
                          {timeVal}
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* Form fields sync for hook form */}
                {apptType === 'clinic' && (
                  <input type="hidden" {...register('slot_id', { required: 'Please select a clinic slot' })} />
                )}
                <input type="hidden" {...register('appointment_time', { required: 'Please choose a time slot' })} />
                {errors.appointment_time && <span className="text-red-400 text-[10px]">{errors.appointment_time.message}</span>}
              </div>
            )}

            {/* Map Integration (Only Home Service) */}
            {apptType === 'home' && (
              <div className="flex flex-col gap-2 border-t border-slate-800 pt-6">
                <h4 className="text-xs font-bold text-teal-450 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-teal-400" /> Pinned Service Location
                </h4>
                <Controller
                  name="mapLocation"
                  control={control}
                  rules={{
                    validate: (val) => !!val.address || 'You must locate/pin an address on the map'
                  }}
                  render={({ field }) => (
                    <MapInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.mapLocation && <span className="text-red-400 text-[10px]">{errors.mapLocation.message}</span>}
              </div>
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-6">
              <label className="text-xs font-semibold text-white flex items-center gap-1">
                <FileText className="w-4 h-4 text-black" /> Additional Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention eye conditions, allergies, or location details here..."
                className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-teal-500 text-xs resize-none"
                {...register('notes')}
              ></textarea>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || (apptType === 'clinic' && !watch('slot_id')) || !watch('appointment_time')}
              className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-850 disabled:text-slate-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-2 shadow-lg shadow-teal-500/10"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Finalizing reservation...
                </>
              ) : (
                <>
                  Confirm Booking <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
