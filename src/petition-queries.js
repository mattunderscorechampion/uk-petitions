
'use strict';

var preconditions = {
    samePetitionId : function(petition0, petition1) {
        if (!checks.samePetitionId(petition0, petition1)) {
            throw new Error('Petition IDs should be the same but are different');
        }
    }
};

function reached10_000(data) {
    return data.attributes.signature_count >= 10000;
}

function reached100_000(data) {
    return data.attributes.signature_count >= 100000;
}

function governmentResponded(data) {
    return data.attributes.government_response !== null;
}

function debated(data) {
    return data.attributes.debate !== null;
}

var checks = {
    samePetitionId : function(petition0, petition1) {
        return petition0.id === petition1.id;
    },
    delta : {
        reached10_000 : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return reached10_000(newData) && !reached10_000(oldData);
        },
        reached100_000 : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return reached100_000(newData) && !reached100_000(oldData);
        },
        governmentResponded : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return governmentResponded(newData) && !governmentResponded(oldData);
        },
        debated : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return debated(newData) && !debated(oldData);
        }
    }
};

module.exports = {
    predicates : {
        reached10_000 : reached10_000,
        reached100_000 : reached100_000,
        governmentResponded : governmentResponded,
        debated : debated
    },
    checks : checks
};
