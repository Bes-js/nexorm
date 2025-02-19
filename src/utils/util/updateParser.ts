import type { UpdateOptions, RulesOptions } from '../decorator';
import { ruleParser } from './ruleParser';
import { Model } from 'sequelize';
import _ from 'lodash';


export async function updateParser(
    sequelizeModel: Model<any, any>,
    update: UpdateOptions<any>,
    rules: RulesOptions<any>,
    modelName: string,
    schema: any
) {



    var dataValues = sequelizeModel.dataValues;
    var parsed = parseValue(schema);


    var operators = Object.keys(update);
    var parsedUpdate = { ...dataValues } as any;
    if (!parsedUpdate) parsedUpdate = {};

    for (var op in operators) {
        var operator = operators[op];
        var valuesList = (update as any)[operator];
        var values = Object.entries(valuesList);


        for (var [key, valueData] of values) {

            var value = valueData as any;
            

            /* Global Operations */
            if (operator == '$set') {

                if (String(key).includes('.')) {
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, value);
                    

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    parsedUpdate[key] = value;
                }
            };




            if (operator == '$unset') {
                if (String(key).includes('.')) {
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, null);

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    parsedUpdate[key] = null;
                }
            };





            if (operator == '$clear') {
                if (String(key).includes('.')) {
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => {
                        if (String(value).includes('Object')) return {};
                        if (String(value).includes('Array')) return [];
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    parsedUpdate[key] = {};
                }
            };





            /* Number Operations */
            if (operator == '$inc') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => value + valueData);

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = parsedUpdate[key] + value;
                }
            };




            if (operator == '$dec') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => value - (valueData as any));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = parsedUpdate[key] - value;
                }
            };




            if (operator == '$mul') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => value * (valueData as any));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = parsedUpdate[key] * value;
                }
            };




            if (operator == '$div') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => value / (valueData as any));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = parsedUpdate[key] / value;
                }
            };




            if (operator == '$min') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.min(value, (valueData as any)));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.min(parsedUpdate[key], value);
                }
            };





            if (operator == '$max') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.max(value, (valueData as any)));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.max(parsedUpdate[key], value);
                }
            };




            if (operator == '$sqrt') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.sqrt(value));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.sqrt(parsedUpdate[key]);
                }
            };




            if (operator == '$floor') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.floor(value));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.floor(parsedUpdate[key]);
                }
            };




            if (operator == '$random') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.random());

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.random();
                }
            };




            if (operator == '$abs') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.abs(value));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.abs(parsedUpdate[key]);
                }
            };




            if (operator == '$ceil') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.ceil(value));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.ceil(parsedUpdate[key]);
                }
            };




            if (operator == '$pow') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.pow(value, (valueData as any)));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.pow(parsedUpdate[key], value);
                }
            };




            if (operator == '$toFixed') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => {
                        if (typeof value !== 'number') throw new Error('$toFixed can only be used with numbers');
                        if (typeof valueData !== 'number') throw new Error('$toFixed can only be used with number values');
                        return value.toFixed(valueData as any);
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (typeof parsedUpdate[key] !== 'number') throw new Error('$toFixed can only be used with numbers');
                    if (typeof value !== 'number') throw new Error('$toFixed can only be used with number values');
                    parsedUpdate[key] = parsedUpdate[key].toFixed(value);
                }
            };




            if (operator == '$toExponential') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => {
                        if (typeof value !== 'number') throw new Error('$toExponential can only be used with numbers');
                        if (typeof valueData !== 'number') throw new Error('$toExponential can only be used with number values');
                        return value.toExponential(valueData);
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (typeof parsedUpdate[key] !== 'number') throw new Error('$toExponential can only be used with numbers');
                    if (typeof value !== 'number') throw new Error('$toExponential can only be used with number values');
                    parsedUpdate[key] = parsedUpdate[key].toExponential(value);
                }
            };




            if (operator == '$toPrecision') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => {
                        if (typeof value !== 'number') throw new Error('$toPrecision can only be used with numbers');
                        if (typeof valueData !== 'number') throw new Error('$toPrecision can only be used with number values');
                        return value.toPrecision(valueData)
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (typeof parsedUpdate[key] !== 'number') throw new Error('$toPrecision can only be used with numbers');
                    if (typeof value !== 'number') throw new Error('$toPrecision can only be used with number values');
                    parsedUpdate[key] = parsedUpdate[key].toPrecision(value);
                }
            };




            if (operator == '$round') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.round(value));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.round(parsedUpdate[key]);
                }
            };




            if (operator == '$trunc') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => Math.trunc(value));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = Math.trunc(parsedUpdate[key]);
                }
            };




            if (operator == '$mod') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => value % (valueData as any));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = parsedUpdate[key] % value;
                }
            };





            /* Boolean Operations */
            if (operator == '$toggle') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => !value);

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = !parsedUpdate[key];
                }
            };





            /* String Operations */
            if (operator == '$append') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => {
                        var newValue = (value || '') + valueData;
                        return newValue;
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    var newValue = (parsedUpdate[key] || '') + value;
                    parsedUpdate[key] = newValue;
                }
            };




            if (operator == '$prepend') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value) => {
                        var newValue = valueData + (value || '');
                        return newValue;
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    var newValue = value + (parsedUpdate[key] || '');
                    parsedUpdate[key] = newValue;
                }
            };



            if (operator == '$replace') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    var searchValue = value?.$searchValue;
                    var replaceValue = value?.$replaceValue;

                    if (!searchValue || !replaceValue) throw new Error('You must provide $searchValue and $replaceValue');
                    if (typeof searchValue !== 'string' || typeof replaceValue !== 'string') throw new Error('$searchValue and $replaceValue must be strings');


                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, String(parsedUpdate[key] || '').replace(searchValue, replaceValue));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    var searchValue = value?.$searchValue;
                    var replaceValue = value?.$replaceValue;

                    if (!searchValue || !replaceValue) throw new Error('You must provide $searchValue and $replaceValue');
                    if (typeof searchValue !== 'string' || typeof replaceValue !== 'string') throw new Error('$searchValue and $replaceValue must be strings');

                    parsedUpdate[key] = (parsedUpdate[key] || '').replace(value.$searchValue, value.$replaceValue);
                }
            };


            if (operator == '$trim') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, (parsedUpdate[key] || '').trim());

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = (parsedUpdate[key] || '').trim();
                }
            };

            if (operator == '$substr') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, (parsedUpdate[key] || '')?.substr(valueData));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = (parsedUpdate[key] || '').substr(value);
                }
            };

            if (operator == '$capitalize') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, (parsedUpdate[key] || '').charAt(0).toUpperCase() + (parsedUpdate[key] || '').slice(1));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = (parsedUpdate[key] || '').charAt(0).toUpperCase() + (parsedUpdate[key] || '').slice(1);
                }
            };

            if (operator == '$reverse') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, (parsedUpdate[key] || '').split('').reverse().join(''));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = (parsedUpdate[key] || '').split('').reverse().join('');
                }
            };

            if (operator == '$slice') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};

                    var $begin = value.$begin;
                    var $end = value.$end;

                    if (typeof $begin !== 'number' || typeof $end !== 'number') throw new Error('$begin and $end must be numbers');

                    let object = _.set(oldObject, key, (parsedUpdate[key] || '').slice(valueData));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    var $begin = value.$begin;
                    var $end = value.$end;

                    if (typeof $begin !== 'number' || typeof $end !== 'number') throw new Error('$begin and $end must be numbers');

                    if ($begin && $end && $begin > $end) throw new Error('$begin must be less than $end');
                    if ($end && $end > (parsedUpdate[key] || '').length) $end = (parsedUpdate[key] || '').length;

                    if (!$begin) $begin = 0;
                    if (!$end) $end = (parsedUpdate[key] || '').length;

                    parsedUpdate[key] = (parsedUpdate[key] || '').slice($begin, $end);
                }
            };

            if (operator == '$lowercase') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, (parsedUpdate[key] || '').toLowerCase());

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = (parsedUpdate[key] || '').toLowerCase();
                }
            };

            if (operator == '$uppercase') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, (parsedUpdate[key] || '').toUpperCase());

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = (parsedUpdate[key] || '').toUpperCase();
                }
            };

            if (operator == '$camelcase') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, _.camelCase((parsedUpdate[key] || '')));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.camelCase((parsedUpdate[key] || ''));
                }
            };

            if (operator == '$kebabcase') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, _.kebabCase((parsedUpdate[key] || '')));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.kebabCase((parsedUpdate[key] || ''));
                }
            };


            if (operator == '$snakecase') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, _.snakeCase((parsedUpdate[key] || '')));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.snakeCase((parsedUpdate[key] || ''));
                }
            };

            if (operator == '$titlecase') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.set(oldObject, key, _.startCase((parsedUpdate[key] || '')));

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.startCase((parsedUpdate[key] || ''));
                }
            };


            /* Object Operations */

            if (operator == '$omit') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.omit(oldObject, value);

                    parsedUpdate[key.split('.')[0]] = object;
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.omit(parsedUpdate[key], value);
                }
            };

            if (operator == '$merge') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.merge(oldObject, value);

                    parsedUpdate[key.split('.')[0]] = object;
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.merge(parsedUpdate[key], value);
                }
            };

            if (operator == '$mapKeys') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.mapKeys(oldObject, value);

                    parsedUpdate[key.split('.')[0]] = object;
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.mapKeys(parsedUpdate[key], value);
                }
            };

            if (operator == '$mapValues') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.mapValues(oldObject, value);

                    parsedUpdate[key.split('.')[0]] = object;
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.mapValues(parsedUpdate[key], value);
                }
            };

            if (operator == '$invert') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.invert(oldObject);

                    parsedUpdate[key.split('.')[0]] = object;
                } else {
                    await ruleParser(key,rules, valueData);
                    parsedUpdate[key] = _.invert(parsedUpdate[key]);
                }
            };


            /* Array Operations */
            if (operator == '$push') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);

                    if (value?.hasOwnProperty('$each')) {
                        let oldObject = parsedUpdate[key.split('.')[0]] || {};
                        var getArrayFromObject = _.get(oldObject, key);

                        if (!_.isArray(getArrayFromObject)) getArrayFromObject = [];

                        var newArray = [...getArrayFromObject] as any[];


                        if (value?.hasOwnProperty('$sort')) {
                            value.$each = value?.$each?.sort((a: any, b: any) =>
                                value?.$sort == 1 || value?.$sort == true ?
                                    a - b :
                                    b - a
                            );
                        };

                        if (value?.hasOwnProperty('$position')) {
                            let oldObject = parsedUpdate[key.split('.')[0]] || {};
                            let object = _.update(oldObject, key, (value: any[]) => {
                                let position = (valueData as any).$position;
                                newArray.splice(position, 0, ...(valueData as any)?.$each);
                                return newArray;
                            });

                            parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                        } else {
                            let oldObject = parsedUpdate[key.split('.')[0]] || {};
                            let object = _.update(oldObject, key, (value: any[]) => {
                                if (!value || !_.isArray(value)) value = [];
                                let newArray = value?.concat((valueData as any).$each);
                                return newArray;
                            });

                            parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                        }

                    } else {
                        let oldObject = parsedUpdate[key.split('.')[0]] || {};
                        let object = _.update(oldObject, key, (value: any[]) => {
                            if(!_.isArray(value)) value = [];
                            value.push(valueData)
                            return value;
                        });

                        parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                    }

                } else {
                    await ruleParser(key,rules, valueData);

                    if (value?.hasOwnProperty('$each')) {
                        var newArray = [...(parsedUpdate[key] || [])] as any[];

                        if (value?.hasOwnProperty('$sort')) {
                            value.$each = value?.$each?.sort((a: any, b: any) =>
                                value?.$sort == 1 || value?.$sort == true ?
                                    a - b :
                                    b - a
                            );
                        };

                        if (value?.hasOwnProperty('$position')) {
                            let position = (valueData as any).$position;
                            newArray.splice(position, 0, ...(valueData as any)?.$each);
                        } else {
                            newArray = newArray.concat(value['$each']);
                        }

                        parsedUpdate[key] = newArray;
                    } else {
                        var newArray = [...(parsedUpdate[key] || [])] as any[];
                        newArray.push(value);
                        parsedUpdate[key] = newArray;
                    }
                }
            };


            if (operator == '$pop') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (value: any[]) => {
                        if (!value || !_.isArray(value)) value = [];
                        if (valueData == 1) return value.pop();
                        if (valueData == -1) return value.shift();
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (value == 1) parsedUpdate[key] = parsedUpdate[key].pop();
                    if (value == -1) parsedUpdate[key] = parsedUpdate[key].shift();
                }
            };


            if (operator == '$pull') {

                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]] || {};
                    let object = _.update(oldObject, key, (values: any[]) => {
                        if (value.hasOwnProperty('$in')) {
                            return values?.filter((val) => !value.$in.includes(val));
                        } else
                        if (value.hasOwnProperty('$nin')) {
                            return values?.filter((val) => value.$nin.includes(val));
                        } else
                        if (value.hasOwnProperty('$position')) {
                            return values?.filter((val, index) => index !== value.$position);
                        }
                        if (value.hasOwnProperty('$eq')) {
                            return values?.filter((val) => val !== value.$eq);
                        } else
                        if (value.hasOwnProperty('$ne')) {
                            return values?.filter((val) => val === value.$ne);
                        } else
                        if (value.hasOwnProperty('$lt')) {
                            return values?.filter((val) => val >= value.$lt);
                        } else
                        if (value.hasOwnProperty('$gt')) {
                            return values?.filter((val) => val <= value.$gt);
                        } else
                        if (value.hasOwnProperty('$lte')) {
                            return values?.filter((val) => val > value.$lte);
                        } else
                        if (value.hasOwnProperty('$gte')) {
                            return values?.filter((val) => val < value.$gte);
                        } else {
                            return values?.filter((val) => val !== value);
                        }
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (value.hasOwnProperty('$in')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => !value.$in.includes(val));
                    } else
                    if (value.hasOwnProperty('$nin')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => value.$nin.includes(val));
                    } else
                    if (value.hasOwnProperty('$position')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[], index: number) => index !== value.$position);
                    };
                    if (value.hasOwnProperty('$eq')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val !== value.$eq);
                    } else
                    if (value.hasOwnProperty('$ne')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val === value.$ne);
                    } else
                    if (value.hasOwnProperty('$lt')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val >= value.$lt);
                    } else
                    if (value.hasOwnProperty('$gt')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val <= value.$gt);
                    } else
                    if (value.hasOwnProperty('$lte')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val > value.$lte);
                    } else
                    if (value.hasOwnProperty('$gte')) {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val < value.$gte);
                    } else {
                        parsedUpdate[key] = parsedUpdate[key]?.filter((val: any[]) => val !== value);
                    }
                }
            };



            if (operator === '$addToSet') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]];
                    let object = _.update(oldObject, key, (values: any[]) => {
                        if (value.hasOwnProperty('$each')) {
                            if (!_.isArray(values)) values = [];
                            return _.uniq([...values, ...value?.$each]);
                        } else {
                            if (!_.isArray(values)) values = [];
                            return _.uniq([...values, value]);
                        }
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (value.hasOwnProperty('$each')) {
                        if (!_.isArray(parsedUpdate[key])) parsedUpdate[key] = [];
                        parsedUpdate[key] = _.uniq([...parsedUpdate[key], ...value.$each]);
                    } else {
                        if (!_.isArray(parsedUpdate[key])) parsedUpdate[key] = [];
                        parsedUpdate[key] = _.uniq([...parsedUpdate[key], value]);
                    }
                }
            }


            if (operator === '$sliceArray') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]];
                    let object = _.update(oldObject, key, (values: any[]) => {
                        var $begin = value.$begin;
                        var $end = value.$end;

                        if (typeof $begin !== 'number' || typeof $end !== 'number') throw new Error('$begin and $end must be numbers');
                        if ($begin > $end) throw new Error('$begin must be less than $end');
                        if ($begin < 0) $begin = 0;
                        if ($end > values.length) $end = values.length;
                        if (!_.isArray(values)) values = [];

                        return values.slice($begin, $end);
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    var $begin = value.$begin;
                    var $end = value.$end;

                    if (typeof $begin !== 'number' || typeof $end !== 'number') throw new Error('$begin and $end must be numbers');
                    if ($begin > $end) throw new Error('$begin must be less than $end');
                    if ($begin < 0) $begin = 0;
                    if ($end > parsedUpdate[key].length) $end = parsedUpdate[key].length;
                    if (!_.isArray(parsedUpdate[key])) parsedUpdate[key] = [];

                    parsedUpdate[key] = parsedUpdate[key].slice($begin, $end);
                }
            }


            if (operator === '$concat') {
                if (String(key).includes('.')) {
                    await ruleParser(key,rules, valueData);
                    let oldObject = parsedUpdate[key.split('.')[0]];
                    let object = _.update(oldObject, key, (values: any[]) => {
                        if (!_.isArray(values)) values = [];
                        if (!_.isArray(value)) throw new Error('$concat value must be an array');
                        return values.concat(value);
                    });

                    parsedUpdate[key.split('.')[0]] = object[key.split('.')[0]];
                } else {
                    await ruleParser(key,rules, valueData);
                    if (!_.isArray(parsedUpdate[key])) parsedUpdate[key] = [];
                    if (!_.isArray(value)) throw new Error('$concat value must be an array');
                    parsedUpdate[key] = parsedUpdate[key].concat(value);
                }
            }


        };


    };


    return parsedUpdate;
};




function parseValue(Class: any) {

    var parsedValue = {} as any;
    Object.keys(Class).forEach((key) => {
        var value = Class[key];

        if (String(value).includes('String')) parsedValue[key] = 'string';
        if (String(value).includes('Number')) parsedValue[key] = 'number';
        if (String(value).includes('Boolean')) parsedValue[key] = 'boolean';
        if (String(value).includes('Date')) parsedValue[key] = 'date';
        if (String(value).includes('Array') || _.isArray(value)) parsedValue[key] = 'array';
        if (String(value).includes('Object')) parsedValue[key] = 'object';
    });

    return parsedValue;
};
