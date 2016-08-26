"use strict";

const PEG = require("pegjs");

export default class SOLRGrammarService {
    constructor(RHAUtils, securityService, AUTH_EVENTS, $rootScope) {
        'ngInject';

        this.accounts = [];

        // escaped from solrGrammar.txt
        this.grammarStringInternal = 'query = sequence\r\n\r\nsequence = first:sequencePart cont:sequenceCont { return first + cont; }\r\nsequenceCont = orSequence \/ andSequence \/ \"\"\r\n\r\nandSequence = parts:(\" and \" sequencePart)+ { return [].concat.apply([], parts).join(\"\"); }\r\norSequence = parts:(\" or \" sequencePart)+ { return [].concat.apply([], parts).join(\"\"); }\r\nsequencePart = criteria \/ \"(\" sq:sequence \")\" { return \'(\' + sq + \')\' }\r\n\r\n\r\ncriteria = basicCriteria \/ notCriteria\r\nnotCriteria = \"-\"criteria:basicCriteria {return \'-\' + criteria; }\r\nbasicCriteria = field:basicFieldName \":\"\" \"* value:value { return field + \":\" + value; }\r\n\/ field:severityFieldName \":\"\" \"* value:severityValue { return field + \":\" + value; }\r\n\/ field:statusFieldName \":\"\" \"* value:statusValue { return field + \":\" + value; }\r\n\/ field:groupFieldName \":\"\" \"* value:groupValue { return field + \":\" + value; }\r\n\/ field:productFieldName \":\"\" \"* value:productValue { return field + \":\" + value; }\r\n\/ field:ftsFieldName \":\"\" \"* value:booleanValue { return field + \":\" + value; }\r\n\/ field:accountNumberFieldName \":\"\" \"* value:accountNumberValue { return field + \":\" + value; }\r\n\/ field:accountNameFieldName \":\"\" \"* value:accountNameValue { return field + \":\" + value; }\r\n\r\nvalue = range \/ string\r\nrange = \"[\" from:([^\" \"]+) \" TO \" to:([^\\]]+) \"]\" {return \"[\" + from.join(\"\") + \" TO \" + to.join(\"\") + \"]\"; }\r\nstring = value:([^\" \")]+) { return value.join(\"\"); } \/ \"\\\"\"value:([^\\\"]+)\"\\\"\" { return \'\"\' + value.join(\"\") + \'\"\'; }\r\nbooleanValue = \"true\" \/ \"false\"\r\nnumber = digits:[0-9]+ { return digits.join(\'\'); }\r\n\r\nbasicFieldName = \"contactName\" {return \"case_contactName\";}\r\n\/ \"createdByName\" {return \"case_createdByName\";}\r\n\/ \"createdDate\" {return \"case_createdDate\";}\r\n\/ \"description\" {return \"case_description\";}\r\n\/ \"summary\" {return \"case_summary\";}\r\n\/ \"productVersion\" {return \"case_version\";}\r\n\/ \"lastModifiedDate\" {return \"case_lastModifiedDate\";}\r\n\/ \"lastModifiedByName\" {return \"case_lastModifiedByName\";}\r\n\/ \"owner\" {return \"case_owner\";}\r\n\r\nftsFieldName = \"FTS\" {return \"case_24_7\";}\r\n\r\nseverityFieldName = \"severity\" {return \"case_severity\";}\r\nseverityValue = string\r\n\r\nstatusFieldName = \"status\" {return \"case_status\";}\r\nstatusValue = string\r\n\r\ngroupFieldName = \"group\" {return \"case_folderNumber\";}\r\ngroupValue = string\r\n\r\nproductFieldName = \"productName\" { return \"case_product\"; }\r\nproductValue = string\r\n\r\naccountNumberFieldName = \"accountNumber\" {return \"case_accountNumber\";}\r\naccountNumberValue = number\r\n\r\naccountNameFieldName = \"accountName\" { return \"case_account_name\";}\r\naccountNameValue = string';
        this.grammarStringExternal = 'query = sequence\r\n\r\nsequence = first:sequencePart cont:sequenceCont { return first + cont; }\r\nsequenceCont = orSequence \/ andSequence \/ \"\"\r\n\r\nandSequence = parts:(\" and \" sequencePart)+ { return [].concat.apply([], parts).join(\"\"); }\r\norSequence = parts:(\" or \" sequencePart)+ { return [].concat.apply([], parts).join(\"\"); }\r\nsequencePart = criteria \/ \"(\" sq:sequence \")\" { return \'(\' + sq + \')\' }\r\n\r\n\r\ncriteria = basicCriteria \/ notCriteria\r\nnotCriteria = \"-\"criteria:basicCriteria {return \'-\' + criteria; }\r\nbasicCriteria = field:basicFieldName \":\"\" \"* value:value { return field + \":\" + value; }\r\n\/ field:severityFieldName \":\"\" \"* value:severityValue { return field + \":\" + value; }\r\n\/ field:statusFieldName \":\"\" \"* value:statusValue { return field + \":\" + value; }\r\n\/ field:groupFieldName \":\"\" \"* value:groupValue { return field + \":\" + value; }\r\n\/ field:productFieldName \":\"\" \"* value:productValue { return field + \":\" + value; }\r\n\/ field:ftsFieldName \":\"\" \"* value:booleanValue { return field + \":\" + value; }\r\n\r\nvalue = range \/ string\r\nrange = \"[\" from:([^\" \"]+) \" TO \" to:([^\\]]+) \"]\" {return \"[\" + from.join(\"\") + \" TO \" + to.join(\"\") + \"]\"; }\r\nstring = value:([^\" \")]+) { return value.join(\"\"); } \/ \"\\\"\"value:([^\\\"]+)\"\\\"\" { return \'\"\' + value.join(\"\") + \'\"\'; }\r\nbooleanValue = \"true\" \/ \"false\"\r\nnumber = digits:[0-9]+ { return digits.join(\'\'); }\r\n\r\nbasicFieldName = \"contactName\" {return \"case_contactName\";}\r\n\/ \"createdByName\" {return \"case_createdByName\";}\r\n\/ \"createdDate\" {return \"case_createdDate\";}\r\n\/ \"description\" {return \"case_description\";}\r\n\/ \"summary\" {return \"case_summary\";}\r\n\/ \"productVersion\" {return \"case_version\";}\r\n\/ \"lastModifiedDate\" {return \"case_lastModifiedDate\";}\r\n\/ \"lastModifiedByName\" {return \"case_lastModifiedByName\";}\r\n\r\nftsFieldName = \"FTS\" {return \"case_24_7\";}\r\n\r\nseverityFieldName = \"severity\" {return \"case_severity\";}\r\nseverityValue = string\r\n\r\nstatusFieldName = \"status\" {return \"case_status\";}\r\nstatusValue = string\r\n\r\ngroupFieldName = \"group\" {return \"case_folderNumber\";}\r\ngroupValue = string\r\n\r\nproductFieldName = \"productName\" { return \"case_product\"; }\r\nproductValue = string';
        this.grammarString = '';

        this.parser = null;

        this.init = function () {
            var isInternal = securityService.loginStatus.authedUser.is_internal;
            this.grammarString = isInternal ? this.grammarStringInternal : this.grammarStringExternal;
            this.initParser();
        };

        this.initParser = function () {
            this.parser = PEG.buildParser(this.grammarString);
        };

        this.parse = function (stringQuery) {
            return this.parser.parse(stringQuery);
        };

        this.setSeverities = function (severities) {
            if (RHAUtils.isEmpty(severities)) return;

            const severitiesValues = severities.map(severity=>`"\\"${severity.name}\\"" { return '"${severity.name}"'; }`).join(' / ');
            const severityRule = 'severityValue = ' + severitiesValues;

            this.grammarString = this.grammarString.replace(/severityValue\s*=.+/, severityRule);

            this.initParser();
        };

        this.setStatuses = function (statuses) {
            if (RHAUtils.isEmpty(statuses)) return;

            const statusValues = statuses.map(status=>`"\\"${status.name}\\"" { return '"${status.name}"'; }`).join(' / ');
            const statusRule = 'statusValue = ' + statusValues;

            this.grammarString = this.grammarString.replace(/statusValue\s*=.+/, statusRule);

            this.initParser();
        };

        this.setGroups = function (groups) {
            if (RHAUtils.isEmpty(groups)) return;

            const groupValues = groups.map(group=>`"\\"${group.name}\\"" { return '${group.number}'; }`).join(' / ');
            const groupRule = 'groupValue = ' + groupValues;

            this.grammarString = this.grammarString.replace(/groupValue\s*=.+/, groupRule);

            this.initParser();
        };

        this.setProducts = function (products) {
            if (RHAUtils.isEmpty(products)) return;

            const productValues = products.map(product=>`"\\"${product.name}\\"" { return '"${product.code}"'; }`).join(' / ');
            const productRule = 'productValue = ' + productValues;

            this.grammarString = this.grammarString.replace(/productValue\s*=.+/, productRule);

            this.initParser();
        };

        this.setUserAccount = function (account) {
            if (RHAUtils.isEmpty(account)) return;

            this.accounts.push(account);
            this.initAccounts();
        };

        this.setBookmarkedAccounts = function (accounts) {
            if (RHAUtils.isEmpty(accounts)) return;

            this.accounts = this.accounts.concat(accounts);
            this.initAccounts();
        };

        this.initAccounts = function () {
            if (RHAUtils.isEmpty(this.accounts)) return;

            const numberValues = this.accounts.map((account) =>`"${account.number}" { return "${account.number}"; }`).join(' / ');
            const nameValues = this.accounts.map((account) =>  `"\\"${account.name}\\"" { return "${account.name}"; }`).join(' / ');
            const numberRule = `accountNumberValue = number / ${numberValues}`;
            const nameRule = `accountNameValue = string / ${nameValues}`;

            this.grammarString = this.grammarString.replace(/accountNumberValue\s*=.+/, numberRule);
            this.grammarString = this.grammarString.replace(/accountNameValue\s*=.+/, nameRule);
            this.initParser();
        };

        if (securityService.loginStatus.isLoggedIn) {
            this.init();
        }

        $rootScope.$on(AUTH_EVENTS.loginSuccess, angular.bind(this, function () {
            this.init();
        }));
    }
}
