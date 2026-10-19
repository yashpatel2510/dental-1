import React, { useState } from 'react';
import {
  GitBranch,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  MessageSquare
} from 'lucide-react';
import { FlowStep } from '../types';

interface BotFlowEditorTabProps {
  flowSteps: FlowStep[];
  onSaveFlowSteps: (steps: FlowStep[]) => void;
  onOpenSimulator: () => void;
}

export const BotFlowEditorTab: React.FC<BotFlowEditorTabProps> = ({
  flowSteps,
  onSaveFlowSteps,
  onOpenSimulator
}) => {
  const [steps, setSteps] = useState<FlowStep[]>(flowSteps);
  const [activeStepId, setActiveStepId] = useState<string>(flowSteps[0]?.id || 'step-1');
  const [newOptionInput, setNewOptionInput] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  const handleUpdateTemplate = (text: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === activeStep.id ? { ...s, messageTemplate: text } : s))
    );
  };

  const handleToggleEnabled = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleAddOption = () => {
    if (!newOptionInput.trim() || !activeStep) return;
    const currentOptions = activeStep.options || [];
    setSteps((prev) =>
      prev.map((s) =>
        s.id === activeStep.id
          ? { ...s, options: [...currentOptions, newOptionInput.trim()] }
          : s
      )
    );
    setNewOptionInput('');
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (!activeStep?.options) return;
    setSteps((prev) =>
      prev.map((s) =>
        s.id === activeStep.id
          ? { ...s, options: s.options?.filter((_, idx) => idx !== indexToRemove) }
          : s
      )
    );
  };

  const handleSave = () => {
    onSaveFlowSteps(steps);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bot Flow & Message Template Editor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize the step-by-step WhatsApp conversational journey, menu options, reminders, and patient prompts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Test In Simulator</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bot flow configuration saved successfully! Live simulator updated.</span>
        </div>
      )}

      {/* 2-Column Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Step Navigation List (4 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">
            Flow Sequence Steps ({steps.length})
          </span>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            {steps.map((step) => {
              const isSelected = step.id === activeStep.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.order}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleEnabled(step.id);
                    }}
                    className="shrink-0 p-1 cursor-pointer"
                    title={step.enabled ? 'Click to Disable Step' : 'Click to Enable Step'}
                  >
                    {step.enabled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Step Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Step {activeStep.order} • {activeStep.key}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeStep.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeStep.description}</p>
              </div>

              <button
                onClick={() => handleToggleEnabled(activeStep.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStep.enabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {activeStep.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Template text area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  WhatsApp Message Template Copy
                </label>
                <span className="text-[11px] text-slate-400">
                  Supports WhatsApp formatting (*bold*, _italic_)
                </span>
              </div>

              <textarea
                rows={6}
                value={activeStep.messageTemplate}
                onChange={(e) => handleUpdateTemplate(e.target.value)}
                className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed bg-slate-50 focus:bg-white"
              />

              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                <span className="font-bold text-slate-400">Available Variables:</span>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">
                  {'{patient_name}'}
                </code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">
                  {'{dentist_name}'}
                </code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">
                  {'{slot}'}
                </code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">
                  {'{reason}'}
                </code>
              </div>
            </div>

            {/* If step has selectable options (e.g. Reason Menu, Slots, Confirmations) */}
            {activeStep.options && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Menu / Quick Action Buttons
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {activeStep.options.length} options defined
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeStep.options.map((option, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2 shadow-2xs"
                    >
                      <span>{option}</span>
                      <button
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-400 hover:text-rose-600 font-bold text-xs"
                        title="Remove option"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new option */}
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="Add menu item (e.g. Dental Implant)..."
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                  <button
                    onClick={handleAddOption}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs"
                  >
                    Add Option
                  </button>
                </div>
              </div>
            )}

            {/* Live WhatsApp Bubble Preview */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Live Patient Bubble Preview
              </span>

              <div className="p-4 rounded-xl bg-[#efeae2] border border-slate-200/80 whatsapp-bg">
                <div className="max-w-md bg-[#e2f7cb] rounded-2xl rounded-tr-xs p-3.5 shadow-xs text-xs text-slate-900 whitespace-pre-line leading-relaxed">
                  {activeStep.messageTemplate
                    .replace('{patient_name}', 'Marcus Sterling')
                    .replace('{dentist_name}', 'Dr. Sarah Jenkins')
                    .replace('{slot}', 'Tomorrow at 10:00 AM')
                    .replace('{reason}', 'Tooth pain')}

                  {activeStep.options && activeStep.options.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-emerald-300/40 flex flex-wrap gap-1">
                      {activeStep.options.map((opt, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-white text-emerald-900 text-[10px] font-semibold border border-emerald-300"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-right text-[10px] text-slate-400 mt-1">
                    10:45 AM • Sent by Bot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
