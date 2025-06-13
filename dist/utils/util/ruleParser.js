"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleParser = ruleParser;
async function ruleParser(value, rules, targetValue) {
    if (!rules || !rules[value] || !targetValue)
        return;
    if (rules[value].$lessThan) {
        if (targetValue && targetValue < rules[value].$lessThan)
            throw new Error(`$rules Value of '${value}' is less than ${rules[value].$lessThan}`);
    }
    ;
    if (rules[value].$greaterThan) {
        if (targetValue && targetValue > rules[value].$greaterThan)
            throw new Error(`$rules Value of '${value}' is greater than ${rules[value].$greaterThan}`);
    }
    ;
    if (rules[value].$lessThanOrEqual) {
        if (targetValue && targetValue <= rules[value].$lessThanOrEqual)
            throw new Error(`$rules Value of '${value}' is less than or equal to ${rules[value].$lessThanOrEqual}`);
    }
    ;
    if (rules[value].$greaterThanOrEqual) {
        if (targetValue && targetValue >= rules[value].$greaterThanOrEqual)
            throw new Error(`$rules Value of '${value}' is greater than or equal to ${rules[value].$greaterThanOrEqual}`);
    }
    ;
    if (rules[value].$range) {
        if (targetValue && targetValue < rules[value].$range.$min || targetValue > rules[value].$range.$max)
            throw new Error(`$rules Value of '${value}' is not in the range`);
    }
    ;
    if (rules[value].$exactLength) {
        if (targetValue && targetValue.length !== rules[value].$exactLength)
            throw new Error(`$rules Value of '${value}' is not of exact length`);
    }
    ;
    if (rules[value].$alphaNumeric) {
        if (targetValue && !String(targetValue)?.match(/^[a-zA-Z0-9]*$/))
            throw new Error(`$rules Value of '${value}' is not alphanumeric`);
    }
    ;
    if (rules[value].$contains) {
        if (targetValue && !String(targetValue)?.includes(rules[value].$contains))
            throw new Error(`$rules Value of '${value}' does not contain the specified value`);
    }
    ;
    if (rules[value].$startsWith) {
        if (targetValue && !String(targetValue)?.startsWith(rules[value].$startsWith))
            throw new Error(`$rules Value of '${value}' does not start with the specified value`);
    }
    ;
    if (rules[value].$endsWith) {
        if (targetValue && !String(targetValue)?.endsWith(rules[value].$endsWith))
            throw new Error(`$rules Value of '${value}' does not end with the specified value`);
    }
    ;
    if (rules[value].$exclude) {
        if (targetValue && targetValue?.includes(rules[value].$exclude))
            throw new Error(`$rules Value of '${value}' contains the specified value`);
    }
    ;
    if (rules[value].$noWhitespace) {
        if (targetValue && String(targetValue)?.match(/\s/))
            throw new Error(`$rules Value of '${value}' contains whitespace`);
    }
    ;
    if (rules[value].$onlySpecialChars) {
        if (targetValue && !String(targetValue)?.match(/[^a-zA-Z0-9]/))
            throw new Error(`$rules Value of '${value}' contains characters other than special characters`);
    }
    ;
    if (rules[value].$noSpecialChars) {
        if (targetValue && String(targetValue)?.match(/[^a-zA-Z0-9]/))
            throw new Error(`$rules Value of '${value}' contains special characters`);
    }
    ;
    if (rules[value].$alpha) {
        if (targetValue && !String(targetValue)?.match(/^[a-zA-Z]*$/))
            throw new Error(`$rules Value of '${value}' is not alphabetic`);
    }
    ;
    if (rules[value].$numeric) {
        if (targetValue && !String(targetValue)?.match(/^[0-9]*$/))
            throw new Error(`$rules Value of '${value}' is not numeric`);
    }
    ;
    if (rules[value].$locale) {
        if (targetValue && !String(targetValue)?.match(/^[a-zA-Z0-9]*$/))
            throw new Error(`$rules Value of '${value}' is not in the specified locale`);
    }
    ;
    if (rules[value].$mustBeTrue) {
        if (targetValue && targetValue !== true)
            throw new Error(`$rules Value of '${value}' is not true`);
    }
    ;
    if (rules[value].$mustBeFalse) {
        if (targetValue && targetValue !== false)
            throw new Error(`$rules Value of '${value}' is not false`);
    }
    ;
    if (rules[value].$multipleOf) {
        if (targetValue && targetValue % rules[value].$multipleOf)
            throw new Error(`$rules Value of '${value}' is not a multiple of ${rules[value].$multipleOf}`);
    }
    ;
    if (rules[value].$positive) {
        if (targetValue && targetValue < 0)
            throw new Error(`$rules Value of '${value}' is not positive`);
    }
    ;
    if (rules[value].$negative) {
        if (targetValue && targetValue > 0)
            throw new Error(`$rules Value of '${value}' is not negative`);
    }
    ;
    if (rules[value].$integer) {
        if (targetValue && !Number.isInteger(targetValue))
            throw new Error(`$rules Value of '${value}' is not an integer`);
    }
    ;
    if (rules[value].$float) {
        if (targetValue && Number.isInteger(targetValue))
            throw new Error(`$rules Value of '${value}' is not a float`);
    }
    ;
    if (rules[value].$even) {
        if (targetValue && targetValue % 2)
            throw new Error(`$rules Value of '${value}' is not even`);
    }
    ;
    if (rules[value].$odd) {
        if (targetValue && !(targetValue % 2))
            throw new Error(`$rules Value of '${value}' is not odd`);
    }
    ;
    if (rules[value].$prime) {
        if (targetValue && targetValue === 1)
            throw new Error(`$rules Value of '${value}' is not prime`);
        for (let i = 2; i < targetValue; i++)
            if (targetValue % i === 0)
                throw new Error(`$rules Value of '${value}' is not prime`);
    }
    ;
    if (rules[value].$perfect) {
        let sum = 0;
        for (let i = 1; i < targetValue; i++)
            if (targetValue && targetValue % i === 0)
                sum += i;
        if (targetValue && sum !== targetValue)
            throw new Error(`$rules Value of '${value}' is not perfect`);
    }
    ;
    if (rules[value].$fibonacci) {
        let a = 0, b = 1, c = 0;
        while (c < targetValue) {
            c = a + b;
            a = b;
            b = c;
        }
        ;
        if (targetValue && c !== targetValue)
            throw new Error(`$rules Value of '${value}' is not fibonacci`);
    }
    ;
    if (rules[value].$powerOfTwo) {
        if (targetValue && Math.log2(targetValue) % 1)
            throw new Error(`$rules Value of '${value}' is not a power of two`);
    }
    ;
    if (rules[value].$powerOfTen) {
        if (targetValue && Math.log10(targetValue) % 1)
            throw new Error(`$rules Value of '${value}' is not a power of ten`);
    }
    ;
    if (rules[value].$powerOf) {
        if (targetValue && Math.log(targetValue) % Math.log(rules[value].$powerOf))
            throw new Error(`$rules Value of '${value}' is not a power of ${rules[value].$powerOf}`);
    }
    ;
    if (rules[value].$finite) {
        if (targetValue && !Number.isFinite(targetValue))
            throw new Error(`$rules Value of '${value}' is not finite`);
    }
    ;
    if (rules[value].$infinite) {
        if (targetValue && Number.isFinite(targetValue))
            throw new Error(`$rules Value of '${value}' is not infinite`);
    }
    ;
    if (rules[value].$palindrome) {
        if (targetValue && targetValue !== targetValue.split("").reverse().join(""))
            throw new Error(`$rules Value of '${value}' is not a palindrome`);
    }
    ;
    if (rules[value].$harshad) {
        if (targetValue && targetValue % targetValue.toString().split("").reduce((a, b) => a + parseInt(b), 0))
            throw new Error(`$rules Value of '${value}' is not harshad`);
    }
    ;
    if (rules[value].$epochTime) {
        if (targetValue && new Date(targetValue).getTime() !== targetValue)
            throw new Error(`$rules Value of '${value}' is not epoch time`);
    }
    ;
    if (rules[value].$angle) {
        if (rules[value].$angle.$unit === 'radian') {
            if (targetValue && targetValue < rules[value].$angle.$range.$min || targetValue > rules[value].$angle.$range.$max)
                throw new Error(`$rules Value of '${value}' is not in the radian range`);
        }
        else if (rules[value].$angle.$unit === 'degree') {
            if (targetValue && targetValue < rules[value].$angle.$range.$min || targetValue > rules[value].$angle.$range.$max)
                throw new Error(`$rules Value of '${value}' is not in the degree range`);
        }
        ;
    }
    ;
    if (rules[value].$logicalOr) {
        if (!rules[value].$logicalOr.some((rule) => rule))
            throw new Error(`$rules Value of '${value}' does not satisfy the logical OR condition`);
    }
    ;
    if (rules[value].$logicalNot) {
        if (rules[value].$logicalNot)
            throw new Error(`$rules Value of '${value}' does not satisfy the logical NOT condition`);
    }
    ;
    if (rules[value].$custom) {
        if (targetValue && !rules[value].$custom(targetValue))
            throw new Error(`$rules Value of '${value}' does not satisfy the custom condition`);
    }
    ;
    if (rules[value].$required) {
        if (!targetValue)
            throw new Error(`$rules Value of '${value}' is $required`);
    }
    ;
    if (rules[value].$maxLength) {
        if (targetValue && targetValue.length > rules[value].$maxLength)
            throw new Error(`$rules Value of '${value}' is greater than ${rules[value].$maxLength}`);
    }
    ;
    if (rules[value].$minLength) {
        if (targetValue && targetValue.length < rules[value].$minLength)
            throw new Error(`$rules Value of '${value}' is less than ${rules[value].$minLength}`);
    }
    ;
    if (rules[value].$unique) {
        if (targetValue && targetValue == rules[value].$unique)
            throw new Error(`$rules Value of '${value}' is not $unique`);
    }
    ;
    if (rules[value].$enum) {
        if (targetValue && !rules[value].$enum.includes(targetValue))
            throw new Error(`$rules Value of '${value}' is not in $enum`);
    }
    ;
    if (rules[value].$default) {
        if (!targetValue)
            targetValue = rules[value].$default;
    }
    ;
    if (rules[value].$match) {
        if (targetValue && !targetValue.match(rules[value].$match))
            throw new Error(`$rules Value of '${value}' does not $match the pattern`);
    }
    ;
    if (rules[value].$trim) {
        targetValue = targetValue.trim();
    }
    ;
    if (rules[value].$validEmail) {
        if (targetValue && !targetValue.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/))
            throw new Error(`$rules Value of '${value}' is not a valid email`);
    }
    ;
    if (rules[value].$validURL) {
        if (targetValue && !targetValue.match(/^(http|https):\/\/[^ "]+$/))
            throw new Error(`$rules Value of '${value}' is not a valid URL`);
    }
    ;
    if (rules[value].$validIP) {
        if (targetValue && !targetValue.match(/^(\d{1,3}\.){3}\d{1,3}$/))
            throw new Error(`$rules Value of '${value}' is not a valid IP`);
    }
    ;
    if (rules[value].$validIPv4) {
        if (targetValue && !targetValue.match(/^(\d{1,3}\.){3}\d{1,3}$/))
            throw new Error(`$rules Value of '${value}' is not a valid IPv4`);
    }
    ;
    if (rules[value].$validIPv6) {
        if (targetValue && !targetValue.match(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/))
            throw new Error(`$rules Value of '${value}' is not a valid IPv6`);
    }
    ;
    if (rules[value].$validCreditCard) {
        if (targetValue && !targetValue.match(/^(\d{4}-){3}\d{4}$/))
            throw new Error(`$rules Value of '${value}' is not a valid Credit Card`);
    }
    ;
}
;
