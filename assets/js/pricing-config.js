/* ==========================================================================
   GREENWORKS — LAWN MAINTENANCE PRICING CONFIG
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE QUOTE CALCULATOR PRICING.
   It is shared by: lawnmain.html, pricing.html, pricing-plan.html

   After editing, hard-refresh the site (Ctrl+Shift+R) to see changes.
   ========================================================================== */

window.GNW_PRICING = {

  /* ---- MOWING (monthly, 4 visits/mo) ----------------------------------- */
  mowing: {
    weekly:   { standalone: 159, bundled: 116 },
    biweekly: { standalone: 129, bundled:  80 }
  },

  /* ---- RECURRING & SEASONAL SERVICES ----------------------------------
     bundled    = price when customer has a qualifying bundle (needs mowing)
     standalone = price on its own (null = no separate standalone rate)     */
  services: {
    'chk-fert':   { bundled:   9, standalone: null, type: 'monthly' },
    'chk-weed':   { bundled:  19, standalone:  39,  type: 'monthly' },
    'chk-land':   { bundled:   9, standalone:  50,  type: 'monthly' },
    'chk-spring': { bundled: 139, standalone: 199,  type: 'onetime' },
    'chk-fall':   { bundled: 179, standalone: 249,  type: 'onetime' }
  },

  /* ---- ONE-TIME ADD-ONS ------------------------------------------------ */
  addons: {
    'chk-aeration': 150,
    'chk-overseed':  70,
    'chk-dethatch': 120
  },

  /* ======================================================================
     LATE-SEASON RULES
     ----------------------------------------------------------------------
     From the cutoff date to Dec 31, there aren't enough months left to sell
     Fertilizer & Weed Control as monthly programs. After the cutoff they
     automatically become ONE-TIME per-application services AND require an
     active mowing plan. Resets to normal monthly pricing every Jan 1.

     To force it on/off for testing, set forceLateSeason to true or false.
     Leave it null for automatic date-based switching.
     ====================================================================== */
  lateSeason: {
    forceLateSeason: null,
    cutoff: { month: 8, day: 15 },        // August 15

    // These services flip to one-time pricing after the cutoff.
    oneTimePricing: {
      'chk-fert': { price:  30, label: 'Fertilizer Application' },
      'chk-weed': { price: 129, label: 'Weed Control Application' }
    },

    // ...and cannot be selected without a mowing plan after the cutoff.
    requiresMowing: ['chk-fert', 'chk-weed'],

    notice: 'Late season: Fertilizer & Weed Control are billed per application ' +
            'and require an active mowing plan.'
  },

  /* ---- RULES ----------------------------------------------------------- */
  rules: {
    bundleThreshold:      { smallLot: 4, standard: 3 },
    bundleRequiresMowing: true,
    smallLotMowingRate:   0.85,
    smallLotServiceRate:  0.75,
    allAddonsRate:        0.75,
    monthlyMinimum:       25,
    serviceMinimums:      { 'chk-land': 28, 'chk-weed': 25 },
    amortizeMonths:       7
  }
};

/* ==========================================================================
   ENGINE — no need to edit below this line
   ========================================================================== */
(function () {
  var CFG = window.GNW_PRICING;
  var LS  = CFG.lateSeason;

  /* Is today past the cutoff (cutoff .. Dec 31)? */
  function isLateSeason() {
    if (LS.forceLateSeason !== null) return LS.forceLateSeason;
    var now = new Date();
    var m = now.getMonth() + 1, d = now.getDate();
    return (m > LS.cutoff.month) || (m === LS.cutoff.month && d >= LS.cutoff.day);
  }

  /* Apply late-season overrides to the service table (once). */
  function applySeasonalPricing() {
    if (!isLateSeason()) return false;
    Object.keys(LS.oneTimePricing).forEach(function (id) {
      var s = CFG.services[id];
      if (!s) return;
      s.bundled    = LS.oneTimePricing[id].price;
      s.standalone = null;          // one flat per-application price
      s.type       = 'onetime';
    });
    return true;
  }

  var LATE = applySeasonalPricing();

  /* Push config prices onto the checkboxes so HTML can't drift from config. */
  function syncCheckboxes() {
    Object.keys(CFG.services).forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      var s = CFG.services[id];
      box.value = s.bundled;
      if (s.standalone === null) box.removeAttribute('data-standalone');
      else box.setAttribute('data-standalone', s.standalone);
      box.setAttribute('data-type', s.type);
    });
    Object.keys(CFG.addons).forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      box.value = CFG.addons[id];
      box.setAttribute('data-type', 'addon');
    });
  }

  /* Late season: block Fertilizer / Weed Control unless mowing is selected. */
  function enforceMowingRequirement() {
    if (!LATE) return;
    var mowNode = document.querySelector('input[name="mowFreq"]:checked');
    var hasMowing = mowNode && mowNode.value !== 'none';

    LS.requiresMowing.forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      var label = box.closest ? box.closest('.service-option') : box.parentElement;
      if (!hasMowing) {
        if (box.checked) box.checked = false;
        box.disabled = true;
        if (label) {
          label.style.opacity = '0.5';
          label.style.pointerEvents = 'none';
          label.title = 'Requires an active mowing plan this late in the season';
        }
      } else {
        box.disabled = false;
        if (label) {
          label.style.opacity = '';
          label.style.pointerEvents = '';
          label.title = '';
        }
      }
    });
  }

  /* Keep the price labels on the cards honest in late season. */
  function fixLateSeasonLabels() {
    if (!LATE) return;
    var lotEl = document.getElementById('qLotSize');
    var mult  = lotEl ? parseFloat(lotEl.value) : 1;
    if (isNaN(mult)) mult = 1;

    Object.keys(LS.oneTimePricing).forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      var wrap = box.closest ? box.closest('.service-option') : box.parentElement;
      if (!wrap) return;
      var price = (LS.oneTimePricing[id].price * mult).toFixed(2);
      var st = wrap.querySelector('.price-standalone');
      var bn = wrap.querySelector('.price-bundled');
      if (st) st.innerHTML = '$' + price + '<br><small>per application</small>';
      if (bn) { bn.innerHTML = ''; bn.style.display = 'none'; }
    });
  }

  /* Small banner so the customer understands why pricing changed. */
  function showNotice() {
    if (!LATE || document.getElementById('gnw-season-notice')) return;
    var firstBox = document.getElementById('chk-fert') || document.getElementById('chk-weed');
    if (!firstBox) return;
    var grid = firstBox.closest ? firstBox.closest('.services-grid-check') : null;
    if (!grid || !grid.parentNode) return;

    var el = document.createElement('div');
    el.id = 'gnw-season-notice';
    el.style.cssText =
      'background:#f2ecdb;border:1px solid #c9a24b;border-left:4px solid #c9a24b;' +
      'border-radius:10px;padding:12px 16px;margin:0 0 14px;font-size:0.86rem;' +
      'color:#0f2e14;text-align:left;line-height:1.45;';
    el.innerHTML = '<strong style="color:#b08a3e;">⚠ ' +
                   'End of Season Pricing</strong><br>' + LS.notice;
    grid.parentNode.insertBefore(el, grid);
  }

  function refresh() {
    enforceMowingRequirement();
    fixLateSeasonLabels();
  }

  function init() {
    syncCheckboxes();
    showNotice();

    // Wrap the page's calculator so our rules run before every calculation
    // and the labels are corrected right after.
    if (typeof window.calculateQuote === 'function') {
      var original = window.calculateQuote;
      window.calculateQuote = function () {
        enforceMowingRequirement();
        var out = original.apply(this, arguments);
        fixLateSeasonLabels();
        return out;
      };
      try { window.calculateQuote(true); } catch (e) {}
    } else {
      refresh();
    }

    // Re-check whenever mowing frequency or lot size changes.
    document.querySelectorAll('input[name="mowFreq"]').forEach(function (r) {
      r.addEventListener('change', refresh);
    });
    var lot = document.getElementById('qLotSize');
    if (lot) lot.addEventListener('change', refresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
