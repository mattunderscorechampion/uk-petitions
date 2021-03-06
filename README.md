
Tools for working with Petitions listed at parliament.uk.

[Library API documentation](https://mattunderscorechampion.github.io/uk-petitions/)

The data available from petition.parliament.uk appears distinct from the data
that will be made available through data.parliament.uk described at
http://explore.data.parliament.uk/?learnmore=Public%20Petitions which looks as
though it will be more searchable. The API described at
http://explore.data.parliament.uk/?learnmore=e-Petitions appears to be a closer
match.

##Build

Build with ```npm run build```.

##Running

Running ```npm run list-hot``` will print a list of hot petitions and signature counts.
Running ```npm run list-all``` will print a list of hot petitions and signature counts.
Running ```npm run monitor``` will persistently monitor the petitions for changes.

##Format

####Example

```JavaScript
{ type: 'petition',
     id: 109702,
     attributes:
      { action: 'Restrict the use of fireworks to reduce stress and fear in animals and pets',
        background: 'Fireworks now occur at all times of the day and evening for many weeks during the autumn and winter. Pet and animal owners struggle to keep their companion animals safe during this extended period. We call for fireworks use by the general public to be permitted on traditional celebration dates only.',
        additional_details: 'The need for reform of the Firework Regulations (2004) has been recognized by a number of organizations and charities. Current regulations are outdated and largely ineffective and we are calling for the improved regulation of fireworks use in the UK. The main need is to restrict fireworks use by the general public to the traditional dates around the Guy Fawkes, New Year’s Eve, Diwali and Chinese New Year celebrations. Further discussion is at: https://www.facebook.com/groups/FireworkABatement/',
        state: 'open',
        signature_count: 67484,
        created_at: '2015-10-01T21:38:23.760Z',
        updated_at: '2015-12-26T14:21:07.344Z',
        open_at: '2015-10-02T14:40:03.194Z',
        closed_at: null,
        government_response_at: '2015-11-05T10:04:18.740Z',
        scheduled_debate_date: null,
        debate_threshold_reached_at: null,
        rejected_at: null,
        debate_outcome_at: null,
        moderation_threshold_reached_at: '2015-10-01T21:59:24.108Z',
        response_threshold_reached_at: '2015-10-27T10:44:48.165Z',
        creator_name: 'Julie Doorne',
        rejection: null,
        government_response:
         { summary: 'We are aware that fireworks can cause distress to animals.  Restrictions on the general public’s use of fireworks, and permitted noise levels, already exist and we have no plans to extend them.',
           details: 'Current firework regulations allow fireworks for home use to be sold during the traditional firework periods of Bonfire Night (15 October – 10 November), New Year’s Eve (26 December – 31 December), Chinese New Year (the day of the Chinese New Year and three days immediately before), and Diwali (the day of Diwali and three days immediately before).\r\n\r\nSuppliers who wish to sell fireworks outside the traditional periods must comply with stringent conditions before being granted a licence by their local licensing authority.  This means the availability and use of fireworks outside the traditional periods has been greatly reduced.\r\n\r\nThe regulations also created a curfew preventing the use of fireworks between 11.00pm and 7.00am all year round with the exception of 5 November, when the curfew starts at 12 midnight, and New Year’s Eve, Chinese New Year and Diwali, when the curfew starts at 1.00 am on the night of celebration.\r\n\r\nWe understand concerns about the distress noisy fireworks can cause to pets, livestock and wildlife.   This is one of the reasons that there is a noise level limit of 120 decibels on fireworks for home use.   We realise, however, that even at this level fireworks noise can be distressing to some animals and refer owners to advice on keeping animals safe during fireworks periods.  This is freely available from animal charities, such as the Blue Cross which gives both general and species-specific advice on its website.\r\n\r\nIn addition there is Government-sponsored advice and guidance on the safe and considerate use of fireworks on the Safer Fireworks website.\r\n\r\nExcessive noise from fireworks, or noise during the curfew period, can be considered a statutory nuisance and local authority environmental health officers have the power to investigate complaints of fireworks noise and act to prevent it where appropriate.\r\n\r\nAlthough there is some use of fireworks outside the traditional periods, we believe that the majority of people who use fireworks do so at the appropriate times of year and have a sensible and responsible attitude towards them.  There are no plans at the moment to place further limitations on their use.\r\n\r\nDepartment for Business, Innovation and Skills',
           created_at: '2015-11-05T10:04:18.737Z',
           updated_at: '2015-11-05T10:04:18.737Z' },
        debate: null,
        signatures_by_country:
         [ { name: 'Afghanistan', signature_count: 1 },
           ...
           { name: 'Vanuatu', signature_count: 1 } ],
        signatures_by_constituency:
         [ { name: 'Edinburgh East',
             ons_code: 'S14000022',
             mp: 'Tommy Sheppard MP',
             signature_count: 81 },
           ...
           { name: 'East Renfrewshire',
             ons_code: 'S14000021',
             mp: 'Kirsten Oswald MP',
             signature_count: 110 } ] } }
```
