/* roi.js — live ROI calculator (AUD). All defaults are illustrative, not Virgin figures. */
(function () {
  "use strict";
  var host = document.getElementById("roiInputs"); if (!host) return;
  var $ = function (id) { return document.getElementById(id); };
  var AHT_MIN = 6; // assumed avg handle time for agent-hours redeployed (illustrative)

  var fmtAUD0 = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
  var fmtNum = new Intl.NumberFormat("en-AU");
  function money(n) { return fmtAUD0.format(Math.round(n)); }

  function read() {
    return {
      volume: +$("roiVolume").value,
      contain: +$("roiContain").value / 100,
      cost: +$("roiCost").value,
      ai: +$("roiAi").value
    };
  }
  function recalc() {
    var v = read();
    $("outVolume").textContent = fmtNum.format(v.volume);
    $("outContain").textContent = Math.round(v.contain * 100) + "%";
    $("outCost").textContent = "$" + v.cost.toFixed(2);
    $("outAi").textContent = "$" + v.ai.toFixed(2);

    var deflected = v.volume * v.contain;
    var saving = deflected * (v.cost - v.ai);
    var hours = deflected * (AHT_MIN / 60);

    $("roiDeflect").textContent = fmtNum.format(Math.round(deflected));
    $("roiSaving").textContent = money(saving);
    $("roiHours").textContent = fmtNum.format(Math.round(hours)) + " hrs";
  }
  host.querySelectorAll("input[type=range]").forEach(function (i) { i.addEventListener("input", recalc); });
  recalc();
})();
