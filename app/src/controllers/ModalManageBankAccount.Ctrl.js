wmoControllers.controller('ModalManageBankAccountCtrl', ['$scope', '$uibModalInstance', 'FilterSortTranslated', 'bankAccounts', 'country', 'openValue',
  function($scope, $uibModalInstance, FilterSortTranslated, bankAccounts, country, openValue) {
    var country = country
      , openValue = openValue
      , account = {};
      
    $scope.bankAccounts = bankAccounts;
    $scope.btnName = 'add';
    $scope.removeBankAccount = function(n){
      $scope.bankAccounts.splice(n, 1);
    };
    $scope.createBankList = function(){
      $scope.bankList = FilterSortTranslated($COUNTRIES[country].bankList);
      $scope.bankName = account.bank = $scope.bankList[0];
    };

    var saveBankAccout = function(n){
      return function(){
        $scope.bankAccounts[n] = JSON.parse(JSON.stringify(account));
        $scope.cleanAndClose();
      };
    };

    var addToBankAccounts = function(){
      $scope.bankAccounts.push({bank: account.bank,
                                branch: account.branch,
                                account: account.account,
                                accountOwner: account.accountOwner
                               });
      $scope.cleanAndClose();
    };

    var disableAddAccount = function(){
      return ! ((!!account.branch  || false) &&
             (!!account.account  || false) &&
             (!!account.accountOwner || false))
    }
    
    $scope.setBankName = function(value){account.bank = value};
    $scope.setBankBranch = function(value){account.branch = value};
    $scope.setBankAccount = function(value){account.account = value};
    $scope.setAccountOwner = function(value){account.accountOwner = value};
    
    $scope.editBankAccout = function(n){
      account = JSON.parse(JSON.stringify($scope.bankAccounts[n]));;
      $scope.bankName = account.bank;
      $scope.bankBranch = account.branch;
      $scope.bankAccount = account.account;
      $scope.accountOwner = account.accountOwner;
      $scope.bankAccountFormTmpl = 'BankAccountFormTmpl.html';
      $scope.btnFunction = saveBankAccout(n);
      $scope.disabledAdd = function(){return false};
      $scope.btnSign = 'ok';
      $scope.btnClass = 'primary';
    };
    
    $scope.addBankAccount = function(){
      $scope.bankAccountFormTmpl = 'BankAccountFormTmpl.html';
      $scope.btnFunction = addToBankAccounts;
      $scope.disabledAdd = disableAddAccount;
      $scope.btnSign = 'plus';
      $scope.btnClass = 'success';
    };

    $scope.cleanAndClose = function(){
      delete $scope.bankName;
      delete $scope.bankBranch;
      delete $scope.bankAccount;
      delete $scope.accountOwner;
      delete $scope.bankAccountFormTmpl;
      account = {};
    };
    
    $scope.isFormOpened = function(){
      return !!$scope.bankAccountFormTmpl;
    };
    
    $scope.initAddAccount = function(){
      if(openValue === 'add'){$scope.addBankAccount()};
    };

    $scope.disabled = function(){
      return $scope.bankAccounts.length === 0;
    };
    $scope.done = function(){
      $uibModalInstance.close($scope.bankAccounts);
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);

