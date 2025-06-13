import { RulesOperators } from '../decorator';

export async function ruleParser(
    value: any,
    rules: RulesOperators<string>,
    targetValue: any
) {
    if (!rules || !(rules as any)[value] || !targetValue) return;

    if ((rules as any)[value].$lessThan) {
        if (targetValue && targetValue < (rules as any)[value].$lessThan) throw new Error(`$rules Value of '${value}' is less than ${(rules as any)[value].$lessThan}`);
    };

    if ((rules as any)[value].$greaterThan) {
        if (targetValue && targetValue > (rules as any)[value].$greaterThan) throw new Error(`$rules Value of '${value}' is greater than ${(rules as any)[value].$greaterThan}`);
    };

    if ((rules as any)[value].$lessThanOrEqual) {
        if (targetValue && targetValue <= (rules as any)[value].$lessThanOrEqual) throw new Error(`$rules Value of '${value}' is less than or equal to ${(rules as any)[value].$lessThanOrEqual}`);
    };

    if ((rules as any)[value].$greaterThanOrEqual) {
        if (targetValue && targetValue >= (rules as any)[value].$greaterThanOrEqual) throw new Error(`$rules Value of '${value}' is greater than or equal to ${(rules as any)[value].$greaterThanOrEqual}`);
    };

    if ((rules as any)[value].$range) {
        if (targetValue && targetValue < (rules as any)[value].$range.$min || targetValue > (rules as any)[value].$range.$max) throw new Error(`$rules Value of '${value}' is not in the range`);
    };

    if ((rules as any)[value].$exactLength) {
        if (targetValue && targetValue.length !== (rules as any)[value].$exactLength) throw new Error(`$rules Value of '${value}' is not of exact length`);
    };

    if ((rules as any)[value].$alphaNumeric) {
        if (targetValue && !String(targetValue)?.match(/^[a-zA-Z0-9]*$/)) throw new Error(`$rules Value of '${value}' is not alphanumeric`);
    };

    if ((rules as any)[value].$contains) {
        if (targetValue && !String(targetValue)?.includes((rules as any)[value].$contains)) throw new Error(`$rules Value of '${value}' does not contain the specified value`);
    };

    if ((rules as any)[value].$startsWith) {
        if (targetValue && !String(targetValue)?.startsWith((rules as any)[value].$startsWith)) throw new Error(`$rules Value of '${value}' does not start with the specified value`);
    };

    if ((rules as any)[value].$endsWith) {
        if (targetValue && !String(targetValue)?.endsWith((rules as any)[value].$endsWith)) throw new Error(`$rules Value of '${value}' does not end with the specified value`);
    };

    if ((rules as any)[value].$exclude) {
        if (targetValue && targetValue?.includes((rules as any)[value].$exclude)) throw new Error(`$rules Value of '${value}' contains the specified value`);
    };

    if ((rules as any)[value].$noWhitespace) {
        if (targetValue && String(targetValue)?.match(/\s/)) throw new Error(`$rules Value of '${value}' contains whitespace`);
    };

    if ((rules as any)[value].$onlySpecialChars) {
        if (targetValue && !String(targetValue)?.match(/[^a-zA-Z0-9]/)) throw new Error(`$rules Value of '${value}' contains characters other than special characters`);
    };

    if ((rules as any)[value].$noSpecialChars) {
        if (targetValue && String(targetValue)?.match(/[^a-zA-Z0-9]/)) throw new Error(`$rules Value of '${value}' contains special characters`);
    };

    if ((rules as any)[value].$alpha) {
        if (targetValue && !String(targetValue)?.match(/^[a-zA-Z]*$/)) throw new Error(`$rules Value of '${value}' is not alphabetic`);
    };

    if ((rules as any)[value].$numeric) {
        if (targetValue && !String(targetValue)?.match(/^[0-9]*$/)) throw new Error(`$rules Value of '${value}' is not numeric`);
    };

    if ((rules as any)[value].$locale) {
        if (targetValue && !String(targetValue)?.match(/^[a-zA-Z0-9]*$/)) throw new Error(`$rules Value of '${value}' is not in the specified locale`);
    };

    if ((rules as any)[value].$mustBeTrue) {
        if (targetValue && targetValue !== true) throw new Error(`$rules Value of '${value}' is not true`);
    };

    if ((rules as any)[value].$mustBeFalse) {
        if (targetValue && targetValue !== false) throw new Error(`$rules Value of '${value}' is not false`);
    };

    if ((rules as any)[value].$multipleOf) {
        if (targetValue && targetValue % (rules as any)[value].$multipleOf) throw new Error(`$rules Value of '${value}' is not a multiple of ${(rules as any)[value].$multipleOf}`);
    };

    if ((rules as any)[value].$positive) {
        if (targetValue && targetValue < 0) throw new Error(`$rules Value of '${value}' is not positive`);
    };

    if ((rules as any)[value].$negative) {
        if (targetValue && targetValue > 0) throw new Error(`$rules Value of '${value}' is not negative`);
    };

    if ((rules as any)[value].$integer) {
        if (targetValue && !Number.isInteger(targetValue)) throw new Error(`$rules Value of '${value}' is not an integer`);
    };

    if ((rules as any)[value].$float) {
        if (targetValue && Number.isInteger(targetValue)) throw new Error(`$rules Value of '${value}' is not a float`);
    };

    if ((rules as any)[value].$even) {
        if (targetValue && targetValue % 2) throw new Error(`$rules Value of '${value}' is not even`);
    };

    if ((rules as any)[value].$odd) {
        if (targetValue && !(targetValue % 2)) throw new Error(`$rules Value of '${value}' is not odd`);
    };

    if ((rules as any)[value].$prime) {
        if (targetValue && targetValue === 1) throw new Error(`$rules Value of '${value}' is not prime`);
        for (let i = 2; i < targetValue; i++)
            if (targetValue % i === 0) throw new Error(`$rules Value of '${value}' is not prime`);
    };

    if ((rules as any)[value].$perfect) {
        let sum = 0;
        for (let i = 1; i < targetValue; i++)
            if (targetValue && targetValue % i === 0) sum += i;
        if (targetValue && sum !== targetValue) throw new Error(`$rules Value of '${value}' is not perfect`);
    };

    if ((rules as any)[value].$fibonacci) {
        let a = 0, b = 1, c = 0;
        while (c < targetValue) {
            c = a + b;
            a = b;
            b = c;
        };
        if (targetValue && c !== targetValue) throw new Error(`$rules Value of '${value}' is not fibonacci`);
    };

    if ((rules as any)[value].$powerOfTwo) {
        if (targetValue && Math.log2(targetValue) % 1) throw new Error(`$rules Value of '${value}' is not a power of two`);
    };

    if ((rules as any)[value].$powerOfTen) {
        if (targetValue && Math.log10(targetValue) % 1) throw new Error(`$rules Value of '${value}' is not a power of ten`);
    };

    if ((rules as any)[value].$powerOf) {
        if (targetValue && Math.log(targetValue) % Math.log((rules as any)[value].$powerOf)) throw new Error(`$rules Value of '${value}' is not a power of ${(rules as any)[value].$powerOf}`);
    };

    if ((rules as any)[value].$finite) {
        if (targetValue && !Number.isFinite(targetValue)) throw new Error(`$rules Value of '${value}' is not finite`);
    };

    if ((rules as any)[value].$infinite) {
        if (targetValue && Number.isFinite(targetValue)) throw new Error(`$rules Value of '${value}' is not infinite`);
    };

    if ((rules as any)[value].$palindrome) {
        if (targetValue && targetValue !== targetValue.split("").reverse().join("")) throw new Error(`$rules Value of '${value}' is not a palindrome`);
    };

    if ((rules as any)[value].$harshad) {
        if (targetValue && targetValue % targetValue.toString().split("").reduce((a:any, b:any) => a + parseInt(b), 0)) throw new Error(`$rules Value of '${value}' is not harshad`);
    };

    if ((rules as any)[value].$epochTime) {
        if (targetValue && new Date(targetValue).getTime() !== targetValue) throw new Error(`$rules Value of '${value}' is not epoch time`);
    };

    if ((rules as any)[value].$angle) {
        if ((rules as any)[value].$angle.$unit === 'radian') {
            if (targetValue && targetValue < (rules as any)[value].$angle.$range.$min || targetValue > (rules as any)[value].$angle.$range.$max) throw new Error(`$rules Value of '${value}' is not in the radian range`);
        } else
        if ((rules as any)[value].$angle.$unit === 'degree') {
            if (targetValue && targetValue < (rules as any)[value].$angle.$range.$min || targetValue > (rules as any)[value].$angle.$range.$max) throw new Error(`$rules Value of '${value}' is not in the degree range`);
        };
    };

    if ((rules as any)[value].$logicalOr) {
        if (!(rules as any)[value].$logicalOr.some((rule: any) => rule)) throw new Error(`$rules Value of '${value}' does not satisfy the logical OR condition`);
    };

    if ((rules as any)[value].$logicalNot) {
        if ((rules as any)[value].$logicalNot) throw new Error(`$rules Value of '${value}' does not satisfy the logical NOT condition`);
    };

    if ((rules as any)[value].$custom) {
        if (targetValue && !(rules as any)[value].$custom(targetValue)) throw new Error(`$rules Value of '${value}' does not satisfy the custom condition`);
    };

    if ((rules as any)[value].$required) {
        if (!targetValue) throw new Error(`$rules Value of '${value}' is $required`);
    };

    if ((rules as any)[value].$maxLength) {
        if (targetValue && targetValue.length > (rules as any)[value].$maxLength) throw new Error(`$rules Value of '${value}' is greater than ${(rules as any)[value].$maxLength}`);
    };

    if ((rules as any)[value].$minLength) {
        if (targetValue && targetValue.length < (rules as any)[value].$minLength) throw new Error(`$rules Value of '${value}' is less than ${(rules as any)[value].$minLength}`);
    };

    if ((rules as any)[value].$unique) {
        if (targetValue && targetValue == (rules as any)[value].$unique) throw new Error(`$rules Value of '${value}' is not $unique`);
    };

    if ((rules as any)[value].$enum) {
        if (targetValue && !(rules as any)[value].$enum.includes(targetValue)) throw new Error(`$rules Value of '${value}' is not in $enum`);
    };

    if ((rules as any)[value].$default) {
        if (!targetValue) targetValue = (rules as any)[value].$default;
    };

    if ((rules as any)[value].$match) {
        if (targetValue && !targetValue.match((rules as any)[value].$match)) throw new Error(`$rules Value of '${value}' does not $match the pattern`);
    };

    if ((rules as any)[value].$trim) {
        targetValue = targetValue.trim();
    };

    if ((rules as any)[value].$validEmail) {
        if (targetValue && !targetValue.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) throw new Error(`$rules Value of '${value}' is not a valid email`);
    };

    if ((rules as any)[value].$validURL) {
        if (targetValue && !targetValue.match(/^(http|https):\/\/[^ "]+$/)) throw new Error(`$rules Value of '${value}' is not a valid URL`);
    };

    if ((rules as any)[value].$validIP) {
        if (targetValue && !targetValue.match(/^(\d{1,3}\.){3}\d{1,3}$/)) throw new Error(`$rules Value of '${value}' is not a valid IP`);
    };

    if ((rules as any)[value].$validIPv4) {
        if (targetValue && !targetValue.match(/^(\d{1,3}\.){3}\d{1,3}$/)) throw new Error(`$rules Value of '${value}' is not a valid IPv4`);
    };

    if ((rules as any)[value].$validIPv6) {
        if (targetValue && !targetValue.match(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)) throw new Error(`$rules Value of '${value}' is not a valid IPv6`);
    };

    if ((rules as any)[value].$validCreditCard) {
        if (targetValue && !targetValue.match(/^(\d{4}-){3}\d{4}$/)) throw new Error(`$rules Value of '${value}' is not a valid Credit Card`);
    };

};