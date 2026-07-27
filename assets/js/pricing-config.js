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
     bundled   = price when customer has a qualifying bundle (needs mowing)
     standalone = price on its own
     Leave standalone null for services that never get a standalone rate.  */
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

  /* ---- RULES ----------------------------------------------------------- */
  rules: {
    // How many services (incl. mowing) unlock bundled pricing.
    bundleThreshold:      { smallLot: 4, standard: 3 },

    // Bundled pricing ALSO requires an active mowing plan. Set false to allow
    // bundle discounts without mowing (not recommended — margin risk).
    bundleRequiresMowing: true,

    // Small lots (0.75x) use a percentage off standalone instead of the
    // bundled rate. 0.85 = 15% off mowing, 0.75 = 25% off other services.
    smallLotMowingRate:   0.85,
    smallLotServiceRate:  0.75,

    // Discount when all three one-time add-ons are selected (0.75 = 25% off).
    allAddonsRate:        0.75,

    // Minimum billable amounts.
    monthlyMinimum:       25,   // floor on ANY recurring plan
    serviceMinimums:      {     // only applied when NO mowing plan selected
      'chk-land': 28,
      'chk-weed': 25
    },

    // Seasonal costs can be split over this many months.
    amortizeMonths:       7
  }
};

/* --------------------------------------------------------------------------
   Keeps the on-page checkboxes in sync with the prices above, so the HTML
   and the calculator can never drift apart.
   -------------------------------------------------------------------------- */
(function syncCheckboxPrices() {
  function apply() {
    var cfg = window.GNW_PRICING;
    Object.keys(cfg.services).forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      var s = cfg.services[id];
      box.value = s.bundled;
      if (s.standalone === null) box.removeAttribute('data-standalone');
      else box.setAttribute('data-standalone', s.standalone);
      box.setAttribute('data-type', s.type);
    });
    Object.keys(cfg.addons).forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      box.value = cfg.addons[id];
      box.setAttribute('data-type', 'addon');
    });
    if (typeof calculateQuote === 'function') {
      try { calculateQuote(true); } catch (e) { /* calculator not on this page yet */ }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
