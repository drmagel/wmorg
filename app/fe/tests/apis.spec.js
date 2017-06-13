describe('WWMMO APIs via test page', function(){

  beforeEach(function(){
    browser.get('/#/tests');    
  });


  it('should have a title', function(){ 
    expect(browser.getTitle()).toEqual('WWMM.ORG');
  });

  describe('setLang:: ', function(){
    it('should set a language', function(){ 
      var ctrl = element.all(by.id('setLangCtrl')).first();
      var langs = ctrl.all(by.repeater('l in ::langs'));
      var direction = ctrl.element(by.exactBinding('lang.direction'));
      var lang = ctrl.element(by.exactBinding('lang.lang'));

//
//    langs.each(function(el, ind){
//      el.getAttribute('value').then(function(text){console.log(text, ind)});
//    });
//
      langs.get(0).click();
      expect(lang.getText()).toEqual('eng');
      expect(direction.getText()).toEqual('ltr');

      langs.get(1).click();
      expect(lang.getText()).toEqual('rus');
      expect(direction.getText()).toEqual('ltr');

      langs.get(2).click();
      expect(lang.getText()).toEqual('heb');
      expect(direction.getText()).toEqual('rtl');
    });
  });

  describe('Enroll::', function(){
    it('should submit an e-mail and receive ver. string and number', function(){ 
      var email = 'dimar@v30.amdocs.com';
      var ctrl = element(by.id('EnrollCtrl'));
      var form = ctrl.element(by.id('enrollForm'));
      var input = ctrl.element(by.id('emailInput'));
      input.sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, email);
      form.submit();
      expect(ctrl.element(by.exactBinding('email')).getText()).toEqual(email);
      expect(ctrl.element(by.exactBinding('number')).getText()).toMatch(/\d*/);
      expect(ctrl.element(by.exactBinding('string')).getText()).toMatch(/\w*/);
    });
  });

  describe('Login::', function(){
    it('should submit valid e-mail and password and return userID and sessID', function(){ 
      var ctrl = element(by.id('LoginCtrl'));
      var form = ctrl.element(by.id('loginForm'));
      var emailInput = ctrl.element(by.id('emailInput'));
      var passwordInput = ctrl.element(by.id('passwordInput'));
    
      var email = 'kuku@wwmm.org';
      var password = '1234';
      
      emailInput.sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, email);
      passwordInput.sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, password);
      form.submit();
      expect(ctrl.element(by.exactBinding('response.userID')).getText()).not.toEqual(0);
      expect(ctrl.element(by.exactBinding('response.userID')).getText()).toMatch(/\d*/);
      expect(ctrl.element(by.exactBinding('response.sessID')).getText()).not.toBe(null);
      expect(ctrl.element(by.exactBinding('response.validTill')).getText()).toMatch(/\d*/);
      expect(ctrl.element(by.exactBinding('response.result')).getText()).toEqual('true');
    });
  });
  
  describe('Login::', function(){
    it('should submit not valid e-mail and password and return userID==0 and result==false', function(){ 
      var ctrl = element(by.id('LoginCtrl'));
      var form = ctrl.element(by.id('loginForm'));
      var emailInput = ctrl.element(by.id('emailInput'));
      var passwordInput = ctrl.element(by.id('passwordInput'));
    
      var email = 'not.valid.user@wwmm.org';
      var password = 'NotValidPassword';
      
      emailInput.sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, email);
      passwordInput.sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, password);
      form.submit();
      expect(ctrl.element(by.exactBinding('response.userID')).getText()).toEqual('0');
      expect(ctrl.element(by.exactBinding('response.sessID')).getText()).toEqual('');
      expect(ctrl.element(by.exactBinding('response.validTill')).getText()).toEqual('');
      expect(ctrl.element(by.exactBinding('response.result')).getText()).toEqual('false');
    });
  });


  
  });

