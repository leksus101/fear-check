/**
 * FEAR PROJECT - CS2 CHEAT CHECK GUIDE & ADMIN TOOLKIT
 * Interactive Client Logic & Utilities
 */

// --- Audio Effects via Web Audio API (Synthesized, no external audio files required) ---
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'copy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }
}

const sounds = new SoundManager();

// --- Toast Notifications ---
function showToast(text, icon = '✓') {
  sounds.play('copy');
  const existing = document.getElementById('fear-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'fear-toast';
  toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-white text-sm font-medium backdrop-blur-lg toast-anim';
  toast.innerHTML = `
    <span class="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">${icon}</span>
    <span>${text}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 2200);
}

// --- Copy to Clipboard Helper ---
function copyText(text, label = 'Скопировано в буфер обмена') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(label, '📋');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast(label, '📋');
  });
}

// --- Tabs Management ---
function switchTab(tabId) {
  sounds.play('click');
  const tabs = ['guide', 'signatures'];
  tabs.forEach(t => {
    const content = document.getElementById(`tab-content-${t}`);
    const navBtn = document.getElementById(`tab-btn-${t}`);
    const mobileBtn = document.getElementById(`mobile-btn-${t}`);

    if (content) {
      if (t === tabId) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    }
    if (navBtn) {
      if (t === tabId) {
        navBtn.classList.add('tab-active');
      } else {
        navBtn.classList.remove('tab-active');
      }
    }
    if (mobileBtn) {
      if (t === tabId) {
        mobileBtn.classList.add('text-cyan-400');
        mobileBtn.classList.remove('text-slate-400');
      } else {
        mobileBtn.classList.remove('text-cyan-400');
        mobileBtn.classList.add('text-slate-400');
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Accordions in Guide ---
function toggleAccordion(id) {
  sounds.play('click');
  const content = document.getElementById(`acc-content-${id}`);
  const icon = document.getElementById(`acc-icon-${id}`);
  if (!content) return;

  const isOpen = content.classList.contains('open');
  if (isOpen) {
    content.classList.remove('open');
    if (icon) icon.style.transform = 'rotate(0deg)';
  } else {
    content.classList.add('open');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
}

function expandAllGuide() {
  sounds.play('click');
  document.querySelectorAll('.accordion-content').forEach(c => c.classList.add('open'));
  document.querySelectorAll('.acc-chevron').forEach(i => i.style.transform = 'rotate(180deg)');
  showToast('Все разделы гайда развернуты', '📂');
}

function collapseAllGuide() {
  sounds.play('click');
  document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
  document.querySelectorAll('.acc-chevron').forEach(i => i.style.transform = 'rotate(0deg)');
  showToast('Все разделы свернуты', '📁');
}

// --- Search Filter across Guide ---
function filterGuide(query) {
  const q = query.trim().toLowerCase();
  const cards = document.querySelectorAll('.guide-step-card');
  let matchCount = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const isMatch = !q || text.includes(q);
    card.style.display = isMatch ? 'block' : 'none';
    if (isMatch && q) {
      matchCount++;
      // Auto open accordion if search matches
      const content = card.querySelector('.accordion-content');
      if (content) content.classList.add('open');
    }
  });

  const searchInfo = document.getElementById('search-results-info');
  if (searchInfo) {
    if (q) {
      searchInfo.textContent = `Найдено разделов: ${matchCount}`;
      searchInfo.classList.remove('hidden');
    } else {
      searchInfo.classList.add('hidden');
    }
  }
}

// --- Toggle Sound Effects ---
function toggleAudio() {
  sounds.enabled = !sounds.enabled;
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.textContent = sounds.enabled ? '🔊 Звук: Вкл' : '🔇 Звук: Выкл';
    btn.classList.toggle('text-cyan-400', sounds.enabled);
    btn.classList.toggle('text-slate-400', !sounds.enabled);
  }
  showToast(sounds.enabled ? 'Звуковые эффекты включены' : 'Звук отключен', sounds.enabled ? '🔊' : '🔇');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Global search input listener
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      filterGuide(e.target.value);
    });
  }
});
