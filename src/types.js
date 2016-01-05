
/**
 * @namespace Petitions
 */

 /**
  * Summary of information about the petition.
  * @typedef {object} Petitions.Summary
  * @property {string} action - The call to action.
  * @property {number} signature_count - The number of signatures.
  */

/**
 * Breakdown of signatures by country.
 * @typedef {object} Petitions.SignaturesByCountry
 * @property {string} name - Name of the country.
 * @property {number} signature_count - The number of signatures from that country.
 */

  /**
 * Detailed information about the petition.
 * @typedef {object} Petitions.Detail
 * @property {string} action - The call to action.
 * @property {number} signature_count - The number of signatures.
 * @property {Petitions.SignaturesByCountry} signatures_by_country - The signatures by country.
 */

 /**
  * Representation of a petition.
  * @typedef {object} Petitions.Petition
  * @property {number} id - The id of the petition.
  * @property {Petitions.Summary|Petitions.Detail} attributes - The information known about the petition.
  */
