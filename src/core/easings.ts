
// Code adapted from https://github.com/juliangarnier/anime

// Elastic easing adapted from jQueryUI http://api.jqueryui.com/easings/
function elastic(t, p) {
    return t === 0 || t === 1 ? t :
        -Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2.0) * Math.asin(1))) * (Math.PI * 2)) / p);
}

// BezierEasing https://github.com/gre/bezier-easing
export const bezier = (() => {
    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
    function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
    function C(aA1) { return 3.0 * aA1 }

    function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
    function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

    function binarySubdivide(aX, aA, aB, mX1, mX2) {
        let currentX, currentT, i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) { aB = currentT } else { aA = currentT }
        } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
        return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (let i = 0; i < 4; ++i) {
            const currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) return aGuessT;
            const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {

        if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
        const sampleValues = new Float32Array(kSplineTableSize);

        if (mX1 !== mY1 || mX2 !== mY2) {
            for (let i = 0; i < kSplineTableSize; ++i) {
                sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
            }
        }

        function getTForX(aX) {
            let intervalStart = 0.0;
            let currentSample = 1;
            const lastSample = kSplineTableSize - 1;

            for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += kSampleStepSize;
            }
            --currentSample;

            const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
            const guessForT = intervalStart + dist * kSampleStepSize;
            const initialSlope = getSlope(guessForT, mX1, mX2);

            if (initialSlope >= 0.001) {
                return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
            } else if (initialSlope === 0.0) {
                return guessForT;
            } else {
                return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
            }
        }

        return x => {
            if (mX1 === mY1 && mX2 === mY2) return x;
            if (x === 0) return 0;
            if (x === 1) return 1;
            return calcBezier(getTForX(x), mY1, mY2);
        }
    }
    return bezier;
})();


// Unused functions will be tree-shaken out
// Approximated Penner equations http://matthewlein.com/ceaser/
export const linear = x => x;
export const easeInQuad = bezier(0.55, 0.085, 0.68, 0.53);
export const easeInCubic = bezier(0.55, 0.055, 0.675, 0.19);
export const easeInQuart = bezier(0.895, 0.03, 0.685, 0.22);
export const easeInQuint = bezier(0.755, 0.05, 0.855, 0.06);
export const easeInSine = bezier(0.47, 0, 0.745, 0.715);
export const easeInExpo = bezier(0.95, 0.05, 0.795, 0.035);
export const easeInCirc = bezier(0.6, 0.04, 0.98, 0.335);
export const easeInBack = bezier(0.6, -0.28, 0.735, 0.045);
export const easeInElastic = elastic;
export const easeOutQuad = bezier(0.25, 0.46, 0.45, 0.94);
export const easeOutCubic = bezier(0.215, 0.61, 0.355, 1);
export const easeOutQuart = bezier(0.165, 0.84, 0.44, 1);
export const easeOutQuint = bezier(0.23, 1, 0.32, 1);
export const easeOutSine = bezier(0.39, 0.575, 0.565, 1);
export const easeOutExpo = bezier(0.19, 1, 0.22, 1);
export const easeOutCirc = bezier(0.075, 0.82, 0.165, 1);
export const easeOutBack = bezier(0.175, 0.885, 0.32, 1.275);
export const easeOutElastic = (t, f) => 1 - elastic(1 - t, f);
export const easeInOutQuad = bezier(0.455, 0.03, 0.515, 0.955);
export const easeInOutCubic = bezier(0.645, 0.045, 0.355, 1);
export const easeInOutQuart = bezier(0.77, 0, 0.175, 1);
export const easeInOutQuint = bezier(0.86, 0, 0.07, 1);
export const easeInOutSine = bezier(0.445, 0.05, 0.55, 0.95);
export const easeInOutExpo = bezier(1, 0, 0, 1);
export const easeInOutCirc = bezier(0.785, 0.135, 0.15, 0.86);
export const easeInOutBack = bezier(0.68, -0.55, 0.265, 1.55);
export const easeInOutElastic = (t, f) => t < .5 ? elastic(t * 2, f) / 2 : 1 - elastic(t * -2 + 2, f) / 2;
