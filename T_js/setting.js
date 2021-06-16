//Declare variable
//let FHIRserver = 'http://hapi.fhir.org/baseR4/';
//'http://hapi.fhir.org/baseR4/';
let FHIRserver = 'http://203.64.84.213:8080/fhir/';
let globalPatientID, globalName, globalPersonID;
let index = 0,
    iOrganization = -1,
    iAppointment = 0,
    iSlot = 0,
    iSchedule = 0,
    i3 = 0,
    i4 = 0;
let iTeacher = 0;
let curUserID, curOrganizationID, curOrganizationName;
let tableValue, tableValue2, arrTempSlot, arrSchedule;
let arrTeacherID = new Array(),
    arrTeacherName, arrSchedule2;
let arrOrganization2ID = ["2137917", "2139336"];
let arrOrganization2Name = ["testOrganization1", "testOrganization2"];
let iSchedule2 = [0, 0];
tableValue = createMultiArray(tableValue, 4, 5, 5, 10, 30); //total Organization (patient or practitioner) //total Schedule （Course taken） //0.userID(Patient or Practitioner), 1.organizationName, 2.slotID, 3.Slot startTime, 4.Slot endTime, 5.scheduleID, 6.videoName, 7.courseName, 8.videoURL, 9.questionnaireURL, 10.practitionerRoleID, 11.Course start date, 12.Course end date, 13.practitionerName
tableValue2 = createMultiArray(tableValue2, 3, 5, 5, 30, 0);
arrTempSlot = createMultiArray(arrTempSlot, 2, 10, 4, 0, 0); //temporary store all slot of this member	//slot id, start date, end date, schedule id
arrSchedule = createMultiArray(arrSchedule, 2, 5, 6, 0, 0); //store Schedule id	//course name, teacher name, start date, end date, questionnaire1 URL, total slot
arrTeacherName = createMultiArray(arrSchedule, 2, 5, 2, 0, 0);
arrSchedule2 = createMultiArray(arrSchedule, 2, 5, 2, 0, 0);
let arrOrganization = new Array(5); //store organization name
let arrTempSchedule = new Array(); //store Schedule id
let personJSONobj, patientJSONobj, appointmentJSONobj;
//END: Declare variable

function initialize() {
    personJSONobj = {
        "resourceType": "Person",
        "identifier": [{
            "system": "UserID",
            "value": "test1"
        }, {
            "system": "Password",
            "value": "MWI0ZjBlOTg1MTk3MTk5OGU3MzIwNzg1NDRjOTZiMzZjM2QwMWNlZGY3Y2FhMzMyMzU5ZDZmMWQ4MzU2NzAxNA=="
        }],
        "name": [{
            "text": "testPerson1"
        }],
        "telecom": [{
                "system": "email",
                "value": "Jim@example.org"
            }]
            //"link": [ {
            //"target": {
            //"reference": "Patient/2138343",
            //"display": "testPatient1"
            //}
            //} ]
    };

    patientJSONobj = {
        "resourceType": "Patient",
        "name": [{
            "text": "testPatient1"
        }],
        "managingOrganization": {
            "reference": "Organization/2137917"
        },
    };

    appointmentJSONobj = {
        "resourceType": "Appointment",
        "status": "booked",
        "slot": [{
            "reference": "Slot/2138767"
        }],
        "participant": [{
            "actor": {
                "reference": "Patient/2138343",
                "display": "testPatient1"
            }
        }, {
            "actor": {
                "reference": "PractitionerRole/2138342",
                "display": "testPractitionerRole"
            }
        }]
    };
}

function checkRequiredField(reqFieldNum) {
    var count = 0; //計數器
    var Total_Obj = document.getElementsByTagName("input");
    //alert(Total_Obj.length);
    for (var k = 0; k < Total_Obj.length; k++) {
        if (Total_Obj[k].type == "radio") {
            if (Total_Obj[k].checked) count++;
        }
        if (Total_Obj[k].type == "text" || Total_Obj[k].type == "password") {
            if (Total_Obj[k].value != "") count++
        }
        if (Total_Obj[k].type == "email") {
            var emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (Total_Obj[k].value != "") {
                if (emailFormat.test(Total_Obj[k].value)) count++;
                else alert("Email invalid");
            }
        }
    }
    if (reqFieldNum != count) {
        alert("表單未填寫完畢");
        return 0;
    }
    return 1;
}

function createMultiArray(arrName, type, n1, n2, n3, n4) {
    arrName = new Array(n1);
    for (var i = 0; i < arrName.length; i++) {
        arrName[i] = new Array(n2);
    }

    if (type >= 3) {
        for (var i = 0; i < arrName.length; i++) {
            for (var j = 0; j < arrName[i].length; j++) {
                arrName[i][j] = new Array(n3);
            }
        }
    }

    if (type == 4) {
        for (var i = 0; i < arrName.length; i++) {
            for (var j = 0; j < arrName[i].length; j++) {
                for (var k = 0; k < arrName[i].length; k++) {
                    arrName[i][j][k] = new Array(n4);
                }
            }
        }
    }
    return arrName;
}

function getFHIRMyCourse(jsonOBJ, type) { //我的課程
    if (type == "Patient") {
        iOrganization++;
        curUserID = jsonOBJ.id;
        curOrganizationID = jsonOBJ.managingOrganization.reference;
        let urlStr = FHIRserver + curOrganizationID;
        HTTPGetData(urlStr, "Organization");
    } else if (type == "Organization") {
        arrOrganization[iOrganization] = jsonOBJ.name; //organizationName
        let urlStr = FHIRserver + 'Appointment?actor=reference|Patient/' + curUserID;
        HTTPGetData(urlStr, "Appointment");
    } else if (type == "Appointment") {
        if (jsonOBJ.total == 0) alert('data unexist');
        else {
            for (var i = 0; i < ((jsonOBJ.total > 10) ? 10 : jsonOBJ.total); i++) {
                arrTempSlot[iAppointment] = jsonOBJ.entry[i].resource.slot[0].reference; //slotID
                iAppointment++;
            }
            for (var i = 0; i < iAppointment; i++) {
                let urlStr = FHIRserver + arrTempSlot[i];
                HTTPGetData(urlStr, "Slot");
            }
        }
    } else if (type == "Slot") {
        var temp = jsonOBJ.schedule.reference;
        if (!arrTempSchedule.includes(temp)) {
            arrTempSchedule.push(temp);
            arrSchedule[iSchedule][5] = 0;
            iSchedule++;
        }
        var index = arrTempSchedule.indexOf(temp);
        var index1 = arrSchedule[index][5];
        tableValue[iOrganization][index][index1][0] = jsonOBJ.start; //0.Slot startTime (use to paixu)
        tableValue[iOrganization][index][index1][1] = jsonOBJ.end; //1.Slot endTime
        var totVideo = jsonOBJ.appointmentType.coding.length;
        tableValue[iOrganization][index][index1][2] = totVideo - 1;
        var index2 = 3;
        for (var i = 0; i < (totVideo - 1); i++) {
            tableValue[iOrganization][index][index1][index2++] = jsonOBJ.appointmentType.coding[i].display; //videoName
            tableValue[iOrganization][index][index1][index2++] = jsonOBJ.appointmentType.coding[i].code; //videoURL
        }
        tableValue[iOrganization][index][index1][index2++] = jsonOBJ.appointmentType.coding[totVideo - 1].code; //questionnaireURL
        arrSchedule[index][5]++;
        iSlot++;

        if (iAppointment == iSlot) {
            for (var i = 0; i < iSchedule; i++) {
                let urlStr = FHIRserver + arrTempSchedule[i];
                HTTPGetData(urlStr, "Schedule");
            }
        }
    } else if (type == "Schedule") {
        var index = arrTempSchedule.indexOf("Schedule/" + jsonOBJ.id);
        var txt = jsonOBJ.specialty[0].coding[0].display.split('-');
        arrSchedule[index][0] = txt[1]; //0.courseName
        arrSchedule[index][1] = jsonOBJ.actor[0].reference; //1.practitionerRoleID
        txt = jsonOBJ.planningHorizon.start.split("T");
        arrSchedule[index][2] = txt[0]; //2.Course start date
        txt = jsonOBJ.planningHorizon.end.split("T");
        arrSchedule[index][3] = txt[0]; //3.Course end date
        arrSchedule[index][4] = jsonOBJ.identifier[0].value; //4.questionnaire1 URL
        i3++;

        if (iSchedule == i3) {
            for (var i = 0; i < iSchedule; i++) {
                let urlStr = FHIRserver + arrSchedule[i][1];
                HTTPGetData(urlStr, "PractitionerRole");
            }
        }
    } else if (type == "PractitionerRole") {
        arrSchedule[i4][1] = jsonOBJ.practitioner.display;
        i4++;

        if (iSchedule == i4) createTable();
    }
}

let iOrganization2 = -1,
    iSlot2 = 0,
    ScheduleIndex = 0;

function getFHIRCourseList(jsonOBJ, type) { //課程清單
    if (jsonOBJ.total == 0) var iiii = 0;
    else {
        if (type == "PractitionerRole2") {
            for (var i = 0; i < ((jsonOBJ.total > 10) ? 10 : jsonOBJ.total); i++) {
                arrTeacherID.push("PractitionerRole/" + jsonOBJ.entry[i].resource.id); //practitionerRoleID
                arrTeacherName[iTeacher][0] = jsonOBJ.entry[i].resource.practitioner.display; //teacherName
                arrTeacherName[iTeacher][1] = jsonOBJ.entry[i].resource.organization.display; //OrganizationName
                iTeacher++;
            }

            for (var i = 0; i < arrTeacherID.length; i++) {
                let urlStr = FHIRserver + "Schedule?actor=reference|" + arrTeacherID[i];
                HTTPGetData(urlStr, "Schedule2");
            }
        } else if (type == "Schedule2") {
            let locIndex = 0;
            for (var i = 0; i < ((jsonOBJ.total > 10) ? 10 : jsonOBJ.total); i++) {
                let index = arrTeacherID.indexOf(jsonOBJ.entry[i].resource.actor[0].reference); //practitionerRoleID
                let indexOrganization = arrOrganization2Name.indexOf(arrTeacherName[index][1]);
                let iTemp = iSchedule2[indexOrganization];
                arrSchedule2[iTemp][0] = jsonOBJ.entry[i].resource.id;
                arrSchedule2[iTemp][1] = indexOrganization;
                tableValue2[indexOrganization][iTemp][0] = jsonOBJ.entry[i].resource.specialty[0].coding[0].display; //course name			
                tableValue2[indexOrganization][iTemp][1] = arrTeacherName[index][0]; //teacher name									
                var txt = jsonOBJ.entry[i].resource.planningHorizon.start.split("T");
                tableValue2[indexOrganization][iTemp][2] = txt[0];
                txt = jsonOBJ.entry[i].resource.planningHorizon.end.split("T");
                tableValue2[indexOrganization][iTemp][3] = txt[0];
                iSchedule2[indexOrganization]++;
                locIndex++;
            }
            for (var i = 0; i < locIndex; i++) {
                let urlStr = FHIRserver + "Slot?schedule=reference|Schedule/" + arrSchedule2[i][0];
                HTTPGetData(urlStr, "Slot2");
            }
        } else if (type == "Slot2") {
            for (var i = 0; i < ((jsonOBJ.total > 10) ? 10 : jsonOBJ.total); i++) {
                if (jsonOBJ.entry[i].resource.status == "free") {
                    tableValue2[arrSchedule2[ScheduleIndex][1]][ScheduleIndex][iSlot2 + 4] = jsonOBJ.entry[i].resource.id; //practitionerRoleID
                    iSlot2++;
                }
            }
            ScheduleIndex++;

            if (iSchedule2.length == ScheduleIndex) createTable2();
        }
    }
}

var arrPatient = new Array(5);

function getFHIRSelectCourse(retValue, type) { //選課
    var jsonOBJ = JSON.parse(retValue);
    if (type == "Person2") {
        for (var i = 0; i < jsonOBJ.link.length; i++) {
            arrPatient[i] = jsonOBJ.link.target.reference;
        }

        for (var i = 0; i < arrPatient.length; i++) {
            let urlStr = FHIRserver + arrPatient[i];
            HTTPGetData(urlStr, "Patient2");
        }
    }
    // else if (type=="Patient2"){
    // var organizationID= jsonOBJ.managingOrganization.reference;
    // if(organizationID == "")
    // // else{
    // // //create patient
    // // }
    // }
}

function createTable() {
    var table = document.getElementById("TableAppointment");
    var cellIndex;
    var row, noIndex = 1,
        videoName;
    for (var index0 = 0; index0 <= iOrganization; index0++) { //check total organization
        table.innerHTML += '<tr><th  colspan="2">Organization Name: ' + arrOrganization[index0] + '<br>My Course List</th></tr>';
        for (var index1 = 0; index1 < iSchedule; index1++) { //divide per schedule (per mata pelajaran)
            table.innerHTML += '<tr><td colspan="3">課程名稱: ' + arrSchedule[index1][0] + '<br>教授: ' + arrSchedule[index1][1] + '<br>課程期間: ' + arrSchedule[index1][2] + ' 至 ' + arrSchedule[index1][3] + '<br><a href="' + arrSchedule[index1][4] + '" target="_blank" >問卷 URL</a></td></tr>';
            table.innerHTML += '<tr><th>No.</th><th>Video</th></tr>';
            var totSlot = arrSchedule[index1][5];
            for (var index2 = 0; index2 < totSlot; index2 += 5) { //per Slot
                var totVideo = tableValue[index0][index1][index2][2];
                for (var index3 = 3; index3 < totVideo * 2; index3 += 2) { //total video
                    row = table.insertRow(-1);
                    videoName = tableValue[index0][index1][index2][index3].split("_");
                    row.insertCell(0).innerHTML = videoName[0];
                    var elLink = document.createElement('a');
                    elLink.href = tableValue[index0][index1][index2];
                    elLink.innerHTML = videoName[1];
                    row.insertCell(1).appendChild(elLink);
                }
                row = table.insertRow(-1);
                elLink = document.createElement('a');
                elLink.target = "_blank";
                elLink.href = tableValue[index0][index1][index2][totVideo * 2 + 3];
                elLink.innerHTML = "問卷 URL";
                var x = row.insertCell(0);
                x.appendChild(elLink);
                x.colSpan = 2;
                x.align = "center";
            }
        }
    }
}

function createTable2() {
    var table = document.getElementById("TableCourseSelection");
    var cellIndex;
    var row, noIndex = 1,
        txt;
    for (var index0 = 0; index0 <= iOrganization2; index0++) { //check total organization
        table.innerHTML += '<tr><th bgcolor="#ebebe0" colspan="5">Organization Name: ' + arrOrganization2Name[index0] + '</th></tr>';
        table.innerHTML += '<tr><th>No.</th><th>Course Name</th><th>Teacher</th><th>Period</th><th>Select</th></tr>';
        noIndex = 1;
        for (var index1 = 0; index1 < iSchedule2[index0]; index1++) { //divide per schedule (per mata pelajaran)
            txt = '<tr><td>' + noIndex + '</td><td>' + tableValue2[index0][index1][0] + '</td><td>' + tableValue2[index0][index1][1] + '</td><td>' + tableValue2[index0][index1][2] + ' 至 ' + tableValue2[index0][index1][3] + '</td>';

            if (tableValue2[index0][index1][4] == null)
                txt += '<td style="color: red">額滿</td></tr>'
                //document.getElementById("myBtn").disabled = false;
            else
                txt += '<td><button value="' + index0 + '&' + index1 + '" onclick="selectCourse(this.value)">選課</button></td></tr>'

            table.innerHTML += txt;
            noIndex++;
        }
    }
}

function selectCourse(val) {
    let index = val.split('&');
    let index0 = index[0];
    let index1 = index[1];
    let i = 4;
    //cek patient apakah ad lian ke organization ini
    let urlStr = FHIRserver + "Person/" + globalPersonID;
    HTTPGetData(urlStr, "Person3");
    // while(tableValue2[index0][index1][i] != null){
    // tableValue2[index0][index1][4]
    // 

    // i++;
    // }
}

function queryParam() {
    var url = location.href;
    if (url.indexOf('?') != -1) {
        var ary = url.split('?')[1].split('&');
        for (i = 0; i <= ary.length - 1; i++) {
            if (ary[i].split('=')[0] == 'patientID')
                globalPatientID = ary[i].split('=')[1];
            else if (ary[i].split('=')[0] == 'name')
                globalName = decodeURIComponent(ary[i].split('=')[1]);
            else if (ary[i].split('=')[0] == 'personID')
                globalPersonID = ary[i].split('=')[1];
        }
    }
}

function HTTPGetData(urlStr, type) {
    var HttpObj = new XMLHttpRequest();
    HttpObj.onreadystatechange = function() {
        if (this.readyState === 4) {
            ret = this.responseText;
            //alert(ret);
            var jsonOBJ = JSON.parse(ret);
            if (type == "loginVerify") checkUsername(jsonOBJ);
            else if (type == "CheckPersonUserID") checkUsername(jsonOBJ);
            else if (type == "PractitionerRole2" || type == "Schedule2" || type == "Slot2") getFHIRCourseList(jsonOBJ, type);
            else getFHIRMyCourse(jsonOBJ, type);
        }
    }
    HttpObj.open("GET", urlStr, true);
    HttpObj.send();
}

function HTTPPostData(urlStr, dataStr) {
    var HttpObj = new XMLHttpRequest();
    HttpObj.open("POST", urlStr, true);
    HttpObj.setRequestHeader("Content-type", "application/json+fhir");
    //HttpObj.setRequestHeader("Content-type", "application/xml+fhir");
    HttpObj.onreadystatechange = function() {
        if (this.readyState === 4) {
            ret = this.responseText;
            //alert(ret);
        }
    }
    HttpObj.send(dataStr);
}

function HTTPPutData(urlStr, dataStr) {
    document.getElementById("TextArea1").value = dataStr;
    var HttpObj = new XMLHttpRequest();
    HttpObj.open("PUT", urlStr, true);
    HttpObj.setRequestHeader("Content-type", "application/json+fhir");
    HttpObj.onload = function() {
        if (HttpObj.readyState === 4) {
            ret = HttpObj.responseText;
            //alert(ret);
        }
    }
    HttpObj.send(dataStr);
}