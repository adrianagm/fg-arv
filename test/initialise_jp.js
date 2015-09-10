function initialise_jp() {

  builAPIObject();

  function builAPIObject() {
    //###########################################################################################################
    //###########################################################################################################
    //### THE API OBJECT ########################################################################################
    //###########################################################################################################
    //###########################################################################################################

    var apiObject = { // The APIObject (this is a simple sample, actual funcionality must be provided by portal).
      getGoogleClientID: function() {
        return 'gme-snowdropsolutions1';
      },
      getDOMElementID: function() {
        return "fg-arv-element";
      },
      getInitialFormValues: function() {
        return {
          from: 'London',
          to: 'Birmingham',
          date: new Date(),
          time: '18:00'
        }; // For testing.
      },
      getFavouritesRoutes: function() {
        return ['aoyHzcYqoYndrwnCtgyEmwHnnhygDta', 'ymyHygRxGuElEaNlQiXva_JtPoJhGeODeSeDcEQiGBqKnTE_hCbaAaBqkZhuD_Ij_AoIzloGbznDfACflcbfaAcAbAjmIlhAyGdswPpiACdgxBvpfKrjAdMhbCAbWcInqoUxeA_llgCyYhtAkLbiAivtFsOjmDgGnmAiFtbkMbmeUsohfjBy_mBgwsRdccElPGpmJf_BFfqBlCvrAnHvkbHdfvAlsDjPjmyOfmYjmsYbsiUfiAyQzkAwJleoHhRiHhWiC__UiLhvgVvhAqKnOodOgNrIHJVbgmazYyShaUzaoORmRzNsUzKovFqyjRkMrIgMzPqVWmUpDea_JgdfsTnBThRdAqPthqhjaBctjB_cAuhnaBwShmjAlBsyfB_ZixshjdsSnQsWbU_SQoOpViadwrxqAaeAzyAolqAifbpAcxjvAyxAlBm_dm_OdWmWpmcchAiOzltrASrySdxmSzjiAlBmsfvAizddBeypnBuceAgUbekTlYyXbVqhOiMrCs_xCubxCchXaZlQeUpB_gHgeaFgWhCsVIqmZbihSodtQaYfYgPtYKjZQvqoTxp_VpWmWzJiLHyNoC_uKuZqFeOyBuiCkbyC_zoRmdeAeCiazCwenLufQkXbaWfjY_bjGglKoXnZoQfc_z_ByndiAknyAyXhU_McAkRjEqNjIocjbnmgZS_XpPkUvXoTxj_IhsJnhAqphAFxiiCfjwDzvuHjgWfz_OpasSXiUhMiEdAqntBwTfHkQpMkccHgCvevoBmjjgGfpsCfCbrDeUdniHasirxA_QdAyDd_AzFnsvHvhlVuCbdLnbyrvuZAaRewQVljnoTKgQEihKqVhEso_EWsCsMpqVlGsXPuUhY_jwTfkyNXKbL_vZkYrwpYifTy_xNkhpQgQdKsUrVaPxUNnZNdSkQfOylMyetHwZhL_RM_WrXUvdwHzQMxsyKthAkdgAoZbybvrAwRpqSfgoFrSClL_AxDitBhAtA_nsN'];
      },
      saveFavouriteRoute: function(favouriteRoute) {
        var deferred = jQuery.Deferred();
        console.log('Save favourite route: ' + favouriteRoute);
        deferred.resolve();
        return deferred.promise();
      },
      removeFavouriteRoute: function(favouriteRoute) {
        var deferred = jQuery.Deferred();
        console.log('Remove favourite route: ' + favouriteRoute);
        deferred.resolve();
        return deferred.promise();
      }
    };


    //###########################################################################################################
    //###########################################################################################################

    // *********************************************************
    FG_ARV.init(apiObject); // FG Alternative Routes Viewer initialisation.
    // *********************************************************

    //###########################################################################################################
    //###########################################################################################################


  }

}