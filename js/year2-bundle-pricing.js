/* Single source of truth for the "باقة السنة الثانية جامعي" bundle:
   the 9 course IDs it contains and its fixed promo price.
   Individual course prices are NOT duplicated here — each page reads them
   from its own existing price data (course cards on index.html,
   data-price attributes on sign-up.html) via the getCoursePrice callback. */
(function (global) {
  var YEAR2_BUNDLE_COURSE_IDS = [
    'ondes_et_vibrations',
    'electrotechnique_fondamentale1',
    'electronique_fondamentale1',
    'informatique03',
    'probabilite_et_statistique',
    'math3_analyse3',
    'logique_combinatoire_et_sequentielle',
    'methodes_numeriques',
    'theorie_du_signal'
  ];

  var YEAR2_BUNDLE_PROMO_PRICE = 4990;

  function calculateYear2BundleOldPrice(getCoursePrice) {
    var missing = [];
    var total = 0;
    YEAR2_BUNDLE_COURSE_IDS.forEach(function (courseId) {
      var price = getCoursePrice(courseId);
      if (price === null || price === undefined || isNaN(price)) {
        missing.push(courseId);
      } else {
        total += price;
      }
    });
    return { total: total, missing: missing };
  }

  global.Year2BundlePricing = {
    COURSE_IDS: YEAR2_BUNDLE_COURSE_IDS,
    PROMO_PRICE: YEAR2_BUNDLE_PROMO_PRICE,
    calculateOldPrice: calculateYear2BundleOldPrice
  };
})(window);
