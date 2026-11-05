import React from 'react';
import { X, ChevronRight } from 'lucide-react';

export const TOUR_STEPS = [
  {
    title: 'স্বাগতম! 👋',
    content:
      'এটা আপনার <b>২০ দিনের ট্রেডিং জার্নাল</b>। প্রতিদিনের ট্রেড, নিয়ম মানা আর মনের অবস্থা লিখে রাখলে নিজের ভুল ধরা সহজ হয়। চলুন ছোট করে দেখে নিই কোথায় কী আছে।'
  },
  {
    title: 'মাস বেছে নিন',
    content:
      'সবার উপরে <b>Month</b> ঘর। প্রতি মাসের আলাদা লগ থাকে। মাস শেষে <b>+ New month</b> চাপলে নতুন ২০ দিনের লগ খুলবে, আর নতুন মাস ০ থেকে শুরু হবে। মাসের নাম বদলাতেও পারবেন।'
  },
  {
    title: 'ব্যালেন্স ও লস সীমা',
    content:
      '<b>Starting balance</b> এ আপনার ব্যালেন্স দিন। <b>Max daily loss</b> % বা $ যেকোনোটায় দিতে পারেন, অন্যটা নিজে হিসাব হবে। কোনো দিনের লস এই সীমায় পৌঁছালে সেই দিনের কার্ড লাল হয়ে সতর্ক করবে। <b>Daily / Total profit target</b> ঘরে টার্গেট লিখুন, টার্গেট ছুঁলে দিনের পাশে 🎯 আসবে আর ব্যালেন্স কার্ডে অগ্রগতির বার দেখাবে।'
  },
  {
    title: 'নম্বর ও ক্যালেন্ডার',
    content:
      '<b>Monthly numbers</b> এ ব্যালেন্স, গ্রাফ, Win rate, Profit factor সব নিজে নিজে হিসাব হয়। ২০ দিনের ক্যালেন্ডারে প্রফিটের দিন <b>সবুজ</b>, লসের দিন <b>লাল</b>, আর ঘরে ট্যাপ করলে সেই দিনের কার্ডে চলে যাবেন।'
  },
  {
    title: 'মার্কেট সেশন',
    content:
      '<b>ফরেক্স মার্কেট সেশন</b> অংশে Sydney, Tokyo, London ও New York বাজার কখন খোলা তা আপনার সময় অনুযায়ী দেখায়। সবুজ রেখা = এখনকার সময়, গাঢ় বার = সেশন খোলা। উপরের ঘর থেকে আপনার দেশের সময় বেছে নিন।'
  },
  {
    title: 'লট সাইজ ক্যালকুলেটর',
    content:
      '<b>🧮 লট সাইজ ক্যালকুলেটর</b> অংশে কয়টা ট্রেড নেবেন, Stop loss (pips) লিখে একটা রিস্ক মোড (Safe / Medium Risk / High Risk) বাছলে (এমাউন্ট ও ঝুঁকি % নিজে থেকে <b>Starting balance</b> ও <b>Max daily loss (%)</b> থেকে আসবে), প্রতি ট্রেডে কত লট নেওয়া ভালো তা বলে দেবে। নিচের তালিকায় বেশি এমাউন্টে কত লট হবে সেটাও দেখাবে।'
  },
  {
    title: 'দিনের কার্ড (১)',
    content:
      'প্রতিদিনের কার্ডে উপর থেকে: <b>Control your emotion</b> আবেগ ধরে রাখতে পারলে ট্যাপ করুন ✅। <b>Rules check</b> খুলে প্রতিটা নিয়মে একবার ট্যাপ = ✓ মেনেছি, দুবার = ✗ ভেঙেছি। <b>Pre-trade checklist</b> ট্রেডের আগে মিলিয়ে নিন: একবার ট্যাপ = ✓ মেনেছি, দুবার = ❌ মানিনি। ফাঁকা বা ❌ থাকলে ট্রেড নয়।'
  },
  {
    title: 'দিনের কার্ড (২)',
    content:
      'ট্রেডের ঘরে <b>Pair</b> লিখুন (যেমন XAUUSD), <b>Dir.</b> এ B = কিনেছি, S = বিক্রি। <b>A+ Set</b> এ সেরা সেটআপ হলে ট্যাপ করুন (একবার Yes, আবার No)। <b>P/L ($)</b> এ লাভ বা লস লিখুন, আর <b>Pips</b> এ কত পিপস লাভ বা লস হলো লিখুন। লস হলে দুটোতেই আগে মাইনাস (-) দিন। দিনে সর্বোচ্চ ৩টি ট্রেড।'
  },
  {
    title: 'দিন শেষে',
    content:
      '<b>Biggest mistake</b> এ আজকের সবচেয়ে বড় ভুল, <b>Next day focus</b> এ কাল কোন বিষয়ে মনোযোগ দেবেন, <b>Mood</b> এ তারা (১ = মন খারাপ/রাগ, ৫ = শান্ত), আর <b>Notes</b> এ যা ইচ্ছা লিখুন। সব লেখা এই ফোনের ব্রাউজারে নিজে থেকে সেভ হয়।'
  },
  {
    title: 'জার্নাল সেভ করুন',
    content:
      'উপরের <b>Download PDF</b> ও <b>Download image</b> বাটনে চাপলে পুরো মাসের জার্নাল সেভ হবে। অন্য ফোন বা ব্রাউজারে লগ নিতে চাইলে <b>Backup</b> বাটনে ফাইল নিয়ে সেখানে <b>Restore</b> দিন। পরে যেকোনো সময় বাম নিচের <b>?</b> বাটনে চাপলে এই গাইড আবার দেখতে পারবেন। শুভ ট্রেডিং! 🚀'
  }
];

interface TourModalProps {
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}

export const TourModal: React.FC<TourModalProps> = ({ currentStep, onNext, onSkip }) => {
  if (currentStep < 0 || currentStep >= TOUR_STEPS.length) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border-t-4 border-t-rose-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white">{step.title}</h3>

        <div
          className="text-sm text-slate-300 leading-relaxed space-y-2 [&>b]:text-sky-300 [&>b]:font-bold"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
          >
            বাদ দিন
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>{isLast ? 'শুরু করি' : 'পরের ধাপ →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
