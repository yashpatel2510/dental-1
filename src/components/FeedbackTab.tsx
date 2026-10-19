import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Download,
  Filter,
  Search,
  Sparkles,
  Send
} from 'lucide-react';
import { FeedbackItem, Booking } from '../types';

interface FeedbackTabProps {
  feedback: FeedbackItem[];
  completedBookingsWithoutFeedback: Booking[];
  onRequestFeedback: (bookingId: string) => void;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  feedback,
  completedBookingsWithoutFeedback,
  onRequestFeedback
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalReviews = feedback.length;
  const avgRating =
    totalReviews > 0
      ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const ratingCounts = {
    5: feedback.filter((f) => f.rating === 5).length,
    4: feedback.filter((f) => f.rating === 4).length,
    3: feedback.filter((f) => f.rating === 3).length,
    2: feedback.filter((f) => f.rating === 2).length,
    1: feedback.filter((f) => f.rating === 1).length
  };

  const filteredFeedback = feedback.filter((f) => {
    const matchesRating = filterRating === 'all' || f.rating === filterRating;
    const matchesSearch =
      f.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & CSAT Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Patient Reviews & CSAT Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Automated WhatsApp post-appointment ratings and patient testimonials.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 rounded-2xl">
              <Star className="w-8 h-8 fill-amber-500 text-amber-500 shrink-0" />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{avgRating}</span>
                  <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-900">
                  {totalReviews} Verified WhatsApp Reviews
                </span>
              </div>
            </div>

            <div className="hidden sm:block border-l border-slate-200 pl-6 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Promoter Score</span>
              <p className="text-2xl font-black text-emerald-600">+82 NPS</p>
              <p className="text-[11px] text-slate-500">Industry benchmark: +58</p>
            </div>
          </div>
        </div>

        {/* Rating Bars & Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <button
                key={stars}
                onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filterRating === stars
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    {stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                  {count} reviews
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending Feedback Requests */}
      {completedBookingsWithoutFeedback.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Recent Completed Visits Awaiting WhatsApp Rating ({completedBookingsWithoutFeedback.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {completedBookingsWithoutFeedback.map((b) => (
              <div
                key={b.id}
                className="bg-white px-3 py-2 rounded-xl border border-amber-300 text-xs flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{b.patientName}</span>
                  <span className="text-slate-500 text-[11px] block">{b.service}</span>
                </div>
                <button
                  onClick={() => onRequestFeedback(b.id)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send WhatsApp Prompt</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Patient Feedback Feed ({filteredFeedback.length})
          </h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search comments or patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {item.patientName}
                    </span>
                    {item.verifiedVisit && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                        Verified Visit
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{item.service}</span>
                </div>

                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                "{item.comment}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Received via WhatsApp</span>
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
