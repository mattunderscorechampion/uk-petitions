
/// <reference path="../node.d.ts" />

export function error (error: Error) {
    console.error('Error: ' + error.message);
}

export function action (data) {
    if (data.attributes) {
        console.log(data.attributes.action);
    }
    else {
        console.log(data.action);
    }
}

export function byCountry (data) {
    if (data.attributes) {
        console.log(data.attributes.action);
        var total_signatures = data.attributes.signature_count;
        data.attributes.signatures_by_country.forEach(function (pair) {
            var percentage = (pair.signature_count / total_signatures) * 100;
            console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
        });
    }
    else {
        console.log(data.action);
        var total_signatures = data.signature_count;
        data.signatures_by_country.forEach(function (pair) {
            var percentage = (pair.signature_count / total_signatures) * 100;
            console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
        });
    }
}

export function withTop5Countries (data) {
    if (data.attributes) {
        console.log('Action: %s', data.attributes.action);
        console.log('Top 5 countries:');
        var total_signatures = data.attributes.signature_count;
        data.attributes.signatures_by_country
            .slice()
            .sort(function(country0, country1) {
                return country1.signature_count - country0.signature_count;
            })
            .slice(0, Math.min(5, data.attributes.signatures_by_country.length))
            .forEach(function (pair) {
                var percentage = (pair.signature_count / total_signatures) * 100;
                console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
            });
    }
    else {
        console.log('Action: %s', data.action);
        console.log('Top 5 countries:');
        var total_signatures = data.signature_count;
        data.signatures_by_country
            .slice()
            .sort(function(country0, country1) {
                return country1.signature_count - country0.signature_count;
            })
            .slice(0, Math.min(5, data.signatures_by_country.length))
            .forEach(function (pair) {
                var percentage = (pair.signature_count / total_signatures) * 100;
                console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
            });
    }
}

export function withSignatureCount (data) {
    if (data.attributes) {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d', data.attributes.signature_count);
    }
    else {
        console.log('Action: %s', data.action);
        console.log('Signatures: %d', data.signature_count);
    }
}

export function withSignatureCountDiff (data, oldData) {
    if (oldData) {
        if (data.attributes) {
            console.log('Action: %s', data.attributes.action);
            console.log('Signatures: %d (was %d)', data.attributes.signature_count, oldData.attributes.signature_count);
        }
        else {
            console.log('Action: %s', data.action);
            console.log('Signatures: %d (was %d)', data.signature_count, oldData.signature_count);
        }
    }
    else {
        if (data.attributes) {
            console.log('Action: %s', data.attributes.action);
            console.log('Signatures: %d', data.attributes.signature_count);
        }
        else {
            console.log('Action: %s', data.action);
            console.log('Signatures: %d', data.signature_count);
        }
    }
}

export function attributes (data) {
    if (data.attributes) {
        console.log(data.attributes);
    }
    else {
        console.log(data);
    }
}
