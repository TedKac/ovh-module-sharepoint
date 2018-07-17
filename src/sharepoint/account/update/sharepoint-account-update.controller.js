angular
  .module('Module.sharepoint.controllers')
  .controller('SharepointUpdateAccountCtrl', class SharepointUpdateAccountCtrl {
    constructor($scope, $q, $stateParams, Alerter, MicrosoftSharepointLicenseService) {
      this.$scope = $scope;
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.alerter = Alerter;
      this.sharepointService = MicrosoftSharepointLicenseService;
    }

    $onInit() {
      this.exchangeId = this.$stateParams.exchangeId;

      this.originalValue = angular.copy(this.$scope.currentActionData);

      this.account = this.$scope.currentActionData;
      this.account.login = this.account.userPrincipalName.split('@')[0]; // eslint-disable-line
      this.account.domain = this.account.userPrincipalName.split('@')[1]; // eslint-disable-line

      this.availableDomains = [];
      this.availableDomains.push(this.account.domain);

      this.$scope.updateMsAccount = () => this.updateMsAccount();

      this.getMsService();
      this.getAccountDetails();
      this.getSharepointUpnSuffixes();
    }

    getMsService() {
      this.sharepointService.retrievingMSService(this.exchangeId)
        .then((exchange) => { this.$scope.exchange = exchange; });
    }

    getAccountDetails() {
      this.sharepointService.getAccountDetails(this.exchangeId, this.account.userPrincipalName)
        .then(accountDetails => _.assign(this.account, accountDetails));
    }

    getSharepointUpnSuffixes() {
      this.sharepointService
        .getSharepointUpnSuffixes(this.exchangeId)
        .then(upnSuffixes => this.$q.all(
          _.filter(upnSuffixes, suffix => this.sharepointService
            .getSharepointUpnSuffixeDetails(this.exchangeId, suffix)
            .then(suffixDetails => suffixDetails.ownershipValidated)),
        ))
        .then((availableDomains) => {
          this.availableDomains = _.union([this.account.domain], availableDomains);
        });
    }

    updateMsAccount() {
      this.account.userPrincipalName = `${this.account.login}@${this.account.domain}`;
      return this.sharepointService.updateSharepoint(this.exchangeId, this.originalValue.userPrincipalName, _.pick(this.account, ['userPrincipalName', 'firstName', 'lastName', 'initials', 'displayName']))
        .then(() => {
          this.alerter.success(this.$scope.tr('sharepoint_account_update_configuration_confirm_message_text', this.account.userPrincipalName), this.$scope.alerts.main);
        })
        .catch((err) => {
          this.alerter.alertFromSWS(this.$scope.tr('sharepoint_account_update_configuration_error_message_text'), err, this.$scope.alerts.main);
        })
        .finally(() => {
          this.$scope.resetAction();
        });
    }
  });
