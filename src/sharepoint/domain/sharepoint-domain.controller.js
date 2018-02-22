angular
    .module("Module.sharepoint.controllers")
    .controller("SharepointDomainsCtrl", class SharepointDomainsCtrl {

        constructor ($scope, $stateParams, Alerter, MicrosoftSharepointLicenseService) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.alerter = Alerter;
            this.sharepointService = MicrosoftSharepointLicenseService;
        }

        $onInit () {
            this.exchangeId = this.$stateParams.exchangeId;
            this.punycode = window.punycode;

            this.getSharepointUpnSuffixes();
        }

        getSharepointUpnSuffixes () {
            this.upnSuffixesIds = null;

            return this.sharepointService.getSharepointUpnSuffixes(this.exchangeId)
                .then((ids) => { this.upnSuffixesIds = ids.map((id) => ({ id })); })
                .catch((err) => { this.alerter.alertFromSWS(this.$scope.tr("sharepoint_accounts_err"), err, this.$scope.alerts.main); });
        }

        showMoreInformation (domain) {
            const message = `${this.$scope.tr("sharepoint_accounts_err")} ${domain.cnameTooltip}`;
            this.alerter.alertFromSWS(message, undefined, this.$scope.alerts.main);
        }

        /* eslint-disable no-shadow */
        onTranformItem (suffix) {
            return this.sharepointService.getSharepointUpnSuffixeDetails(this.exchangeId, suffix)
                .then((suffix) => {
                    if (!suffix.ownershipValidated) {
                        suffix.cnameTooltip = this.$scope.tr("sharepoint_domains_cname_check_tooltip", suffix.cnameToCheck ? `${suffix.cnameToCheck}.${suffix.suffix}` : " ");
                    }
                    suffix.displayName = this.punycode.toUnicode(suffix.suffix);
                    return suffix;
                })
                .catch(() => ({
                    userPrincipalName: suffix
                }));
        }
        /* eslint-enable no-shadow */
    });
