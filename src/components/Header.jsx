import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Menu, Plus, Settings, User } from "lucide-react";
import "./Header.css";

const DEFAULT_MODELS = [
  { id: "beymon-fast", name: "Beymon Fast", description: "Quick everyday answers" },
  { id: "beymon-pro", name: "Beymon Pro", description: "Deeper reasoning" },
];

function ModelSelector({ models, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const selected = models.find((m) => m.id === selectedId) || models[0];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function choose(id) {
    onSelect(id);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="model-select" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="model-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Model: ${selected.name}. Change model`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="model-select__name">{selected.name}</span>
        <ChevronDown className="model-select__chevron" size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="model-select__menu" role="listbox" aria-label="Choose a model">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              role="option"
              aria-selected={model.id === selected.id}
              className="model-select__option"
              onClick={() => choose(model.id)}
            >
              <span className="model-select__option-text">
                <span className="model-select__option-name">{model.name}</span>
                <span className="model-select__option-desc">{model.description}</span>
              </span>
              {model.id === selected.id && (
                <Check className="model-select__check" size={16} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({
  title = "New conversation",
  models = DEFAULT_MODELS,
  selectedModelId,
  onModelChange,
  onNewChat,
  onMenuClick,
  onSettingsClick,
  onProfileClick,
  isMenuOpen = false,
  userName = "Your account",
}) {
  const [internalModelId, setInternalModelId] = useState(models[0]?.id);
  const currentModelId = selectedModelId ?? internalModelId;

  function handleModelSelect(id) {
    setInternalModelId(id);
    onModelChange?.(id);
  }

  return (
    <header className="app-header">
      <div className="app-header__start">
        <button
          type="button"
          className="app-header__icon-btn app-header__menu-btn"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          onClick={onMenuClick}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="app-header__brand">
          <svg className="app-header__logo" viewBox="0 0 80 80" aria-hidden="true">
            <rect width="80" height="80" rx="20" fill="#4F46E5" />
            <path d="M28 20 V58" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
            <path d="M28 20 H42 a9 9 0 0 1 0 18 H28" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 38 H46 a9 9 0 0 1 0 18 H28" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="64" cy="16" r="5" fill="#2DD4BF" />
          </svg>
          <span className="app-header__brand-name">Beymon AI</span>
        </div>
      </div>

      <div className="app-header__center">
        <h1 className="app-header__title" title={title}>
          {title}
        </h1>
      </div>

      <div className="app-header__end">
        <ModelSelector
          models={models}
          selectedId={currentModelId}
          onSelect={handleModelSelect}
        />

        <button type="button" className="app-header__new-chat" onClick={onNewChat}>
          <Plus size={18} aria-hidden="true" />
          <span className="app-header__new-chat-label">New chat</span>
          <span className="visually-hidden app-header__sr-only-mobile">New chat</span>
        </button>

        <button
          type="button"
          className="app-header__icon-btn app-header__settings-btn"
          aria-label="Open settings"
          onClick={onSettingsClick}
        >
          <Settings size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="app-header__icon-btn app-header__profile-btn"
          aria-label={`Open profile menu for ${userName}`}
          onClick={onProfileClick}
        >
          <User size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}