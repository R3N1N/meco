import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import API from '../services/api';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/contacts', { name, email, subject, message });
      alert('Thank you for contacting EyeCare support. We will get back to you shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 py-12 max-w-5xl mx-auto px-4">

      {/* Intro */}
      <div className="text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-black">
          Contact Our Team
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Have questions about home services or scheduling? Reach out and we will assist you.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-4">

        {/* Info card */}
        <div className="md:col-span-1 glass rounded-2xl p-6 border border-slate-800 flex flex-col gap-6 text-left">
          <h3 className="text-md font-bold text-white mb-2">
            Clinic Information
          </h3>

          {/* Address */}
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-widest text-teal-400 font-semibold">
                Main Office
              </span>
              <span className="text-xs text-black">
                Kalanki-14, Kathmandu
              </span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-widest text-teal-400 font-semibold">
                Phone No.
              </span>
              <span className="text-xs text-black">
                9763685921
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-widest text-teal-400 font-semibold">
                Email
              </span>
              <span className="text-xs text-black">
                mecoeyewear@gmail.com
              </span>
            </div>
          </div>

          {/* Hours */}
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-widest text-teal-400 font-semibold">
                Clinic Hours
              </span>
              <span className="text-xs text-black">
                Sun-Fri: 8:00 AM - 8:00 PM
              </span>
              <span className="text-xs text-black">
                Saturday: 10:00 AM - 2:00 PM
              </span>
            </div>
          </div>

          {/* Location label */}
          <div className="mt-2 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-[11px] uppercase tracking-widest text-teal-400 font-semibold">
              Our Location
            </span>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.7540575980033!2d85.28139997612031!3d27.693995326079044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190008636761%3A0xbd72a4aeb8a150e!2sMilan%20Eye%20Care!5e0!3m2!1sen!2snp!4v1782113356003!5m2!1sen!2snp"
              width="100%"
              height="180"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 glass rounded-2xl p-8 border border-slate-800 text-left">
          <h3 className="text-md font-bold text-white mb-4">
            Send a Message
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-950/30 border border-red-900/40 text-red-400 text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-navy-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500 p-2.5 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-navy-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500 p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Subject
              </label>
              <input
                required
                type="text"
                placeholder="Topic of inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-navy-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500 p-2.5 text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Message
              </label>
              <textarea
                required
                rows={4}
                placeholder="Type details of your inquiry here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-navy-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500 p-2.5 text-xs resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;