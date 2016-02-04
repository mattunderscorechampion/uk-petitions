
export function error (error) {
    console.error('Error: ' + error.message);
}

export function action (data) {
    console.log(data.attributes.action);
}

export function byCountry (data) {
    console.log(data.attributes.action);
    var total_signatures = data.attributes.signature_count;
    data.attributes.signatures_by_country.forEach(function (pair) {
        var percentage = (pair.signature_count / total_signatures) * 100;
        console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
    });
}

export function withTop5Countries (data) {
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

export function withSignatureCount (data) {
    console.log('Action: %s', data.attributes.action);
    console.log('Signatures: %d', data.attributes.signature_count);
}

export function withSignatureCountDiff (data, oldData) {
    if (oldData) {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d (was %d)', data.attributes.signature_count, oldData.attributes.signature_count);
    }
    else {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d', data.attributes.signature_count);
    }
}

export function attributes (data) {
    console.log(data.attributes);
}
