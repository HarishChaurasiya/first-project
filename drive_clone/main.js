(function(){
    let btnAddFolder = document.querySelector("#addFolder");
    let btnAddTextFile = document.querySelector("#addTextFile");
    let divbreadCrumb = document.querySelector("#breadCrumb");
    let aRootPath = document.querySelector("a[purpose='path']");
    let divContainer = document.querySelector("#container");

    let divApp = document.querySelector("#app");
    let divAppTitleBar = document.querySelector("#app-title-bar");
    let divAppTitle = document.querySelector("#app-title");
    let divAppMenuBar = document.querySelector("#app-menu-bar");
    let divAppBody = document.querySelector("#app-body");
    let appClose = document.querySelector("#app-close");

    let templates = document.querySelector("#templates");
    let resources = [];
    let cfid = -1;   //Initially we are at root(which is of id -1)
    let rid = 0;


    btnAddFolder.addEventListener("click", addFolder);
    btnAddTextFile.addEventListener("click", addTextFile);
    aRootPath.addEventListener("click", viewFolderFromPath);
    appClose.addEventListener("click", closeApp);


    function closeApp(){
        divAppTitle.innerHTML = " Title will come here";
        divAppTitle.setAttribute("rid", "");
        divAppMenuBar.innerHTML = "";
        divAppBody.innerHTML = "";
    }

    function addFolder(){
        let rname = prompt("Enter folder's name");
        if(rname != null){
            rname = rname.trim();
        }
        //Empty name validation.
        if(!rname){
            alert("Empty name is not allowed.");
            return;
        }
        //uniqueness validation
        
        let alreadyExists = resources.some(r => r.rname == rname && r.pid == cfid);
        if(alreadyExists == true){
            alert(rname +" is already in use. Try something new.");
            return;
        }
        rid++;
        let pid = cfid;
        addFolderHTML(rname, rid, pid);

        resources.push({
            rname: rname,
            rid: rid,
            rtype: "folder",
            pid: pid
        })
        saveToStorage();
    }

    function addFolderHTML(rname, rid, pid){
        let divFolderTemplate = templates.content.querySelector(".folder");
        let divFolder = document.importNode(divFolderTemplate, true);  //It makes a copy of divFolderTemolates to further use.


        let spanRename = divFolder.querySelector("[action='rename']")
        let spanDelete = divFolder.querySelector("[action='delete']")
        let spanView = divFolder.querySelector("[action='view']")
        let divName = divFolder.querySelector("[purpose='name']");
        
        spanRename.addEventListener("click", renameFolder);
        spanDelete.addEventListener("click", deleteFolder);
        spanView.addEventListener("click", viewFolder);
        
        divName.innerHTML = rname;
        divFolder.setAttribute("rid", rid);
        divFolder.setAttribute("pid", pid);

        divContainer.appendChild(divFolder);
    }

    function addTextFileHTML(rname, rid, pid){
        let divTextFileTemplate = templates.content.querySelector(".text-file");
        let divTextFile = document.importNode(divTextFileTemplate, true);  //It makes a copy of divFolderTemolates to further use.


        let spanRename = divTextFile.querySelector("[action='rename']")
        let spanDelete = divTextFile.querySelector("[action='delete']")
        let spanView = divTextFile.querySelector("[action='view']")
        let divName = divTextFile.querySelector("[purpose='name']");
        
        spanRename.addEventListener("click", renameTextFile);
        spanDelete.addEventListener("click", deleteTextFile);
        spanView.addEventListener("click", viewTextFile);
        
        divName.innerHTML = rname;
        divTextFile.setAttribute("rid", rid);
        divTextFile.setAttribute("pid", pid);

        divContainer.appendChild(divTextFile);
    }

    function addTextFile(){
        let rname = prompt("Enter text-file's name");
        if(rname != null){
            rname = rname.trim();
        }
        //Empty name validation.
        if(!rname){
            alert("Empty name is not allowed.");
            return;
        }
        //uniqueness validation
        
        let alreadyExists = resources.some(r => r.rname == rname && r.pid == cfid);
        if(alreadyExists == true){
            alert(rname +" is already in use. Try something new.");
            return;
        }
        rid++;
        let pid = cfid;
        addTextFileHTML(rname, rid, pid);

        resources.push({
            rname: rname,
            rid: rid,
            rtype: "text-file",
            pid: cfid,
            isBold: true,
            isItalic: false,
            isUnderline: false,
            bgColor: "#cd2323",
            textColor:"#FFFFFF",
            fontFamily: "cursive",
            fontSize: 22,
            content: "I am a new file."

        });
        saveToStorage();
    }

    function deleteFolder(){
        //We have to delete all the folders inside.

        let spanDelete = this;
        let divFolder = spanDelete.parentNode;
        let divName = divFolder.querySelector("[purpose='name']");

        let fidTBD = parseInt(divFolder.getAttribute("rid"));
        let fname = divName.innerHTML;

        let childrenExists = resources.some(f => f.pid == fidTBD);
        let sure = confirm(`Are u sure you want to delete this folder, ${fname}?` + (childrenExists? ". It has also children.": ""));
        if(!sure){
            return;
        }
        //remove from html
        divContainer.removeChild(divFolder);
        //remove from RAM
        deleteHelper(fidTBD);
        //storage
        saveToStorage();

    }

    function deleteHelper(fidTBD){
        let children = resources.filter(f => f.pid == fidTBD);
        for(let i = 0; i < children.length; i++){
            deleteHelper(children[i].rid); //This will help in deleting the folders recursively.
        }
        let ridx = resources.findIndex(f => f.rid == fidTBD);
        console.log(resources[ridx].rname);
        resources.splice(ridx, 1);

    }

    function deleteTextFile(){
        let spanDelete = this;
        let divTextFile = spanDelete.parentNode;
        let divName = divTextFile.querySelector("[purpose='name']");

        let fidTBD = parseInt(divTextFile.getAttribute("rid"));
        let fname = divName.innerHTML;

        let sure = confirm(`Are u sure you want to delete this text-file, ${fname}?`);
        if(!sure){
            return;
        }
        //remove from html
        divContainer.removeChild(divTextFile);

        //remove from RAM
        let fidx = resources.findIndex(f => f.rid == fidTBD);
        resources.splice(fidx, 1);

        //storage
        saveToStorage();

    }

    function renameFolder(){
        let nrname = prompt("Enter the new name for the folder");
        if(nrname != null){ //checking for null
            nrname = nrname.trim();  //trimming the new name of the resource.
        }
        if(!nrname){ //Empty name validation
            alert("Empty name is not allowed. Please enter some name.");
            return;
        }

        //old name validation.
        let spanRename = this;
        let divFolder = spanRename.parentNode;
        let divName = divFolder.querySelector("[purpose='name']");
        let orname = divName.innerHTML;  //orname-->old Resource name.
        let ridTBU = parseInt(divFolder.getAttribute("rid"));  //ridTBU  --> rid To Be Updated
        if(nrname == orname){
            alert("Please enter a new name. This is the old name only.");
            return;
        }

        let alreadyExists = resources.some(f => f.rname == nrname && f.pid == cfid);
        if(alreadyExists == true){
            alert(nrname + " is already exists. Please try something new.");
            return;
        }
        
        divName.innerHTML = nrname; //Change in HTML

        //change in ram
        let resource = resources.find(f => f.rid == ridTBU);
        resource.rname = nrname;

        //change in storage
        saveToStorage();

    }

    function renameTextFile(){
        let nrname = prompt("Enter the new name for the test-file");
        if(nrname != null){ //checking for null
            nrname = nrname.trim();  //trimming the new name of the resource.
        }
        if(!nrname){ //Empty name validation
            alert("Empty name is not allowed. Please enter some name.");
            return;
        }

        //old name validation.
        let spanRename = this;
        let divTextFile = spanRename.parentNode;
        let divName = divTextFile.querySelector("[purpose='name']");
        let orname = divName.innerHTML;  //orname-->old Resource name.
        let fidTBU = parseInt(divTextFile.getAttribute("rid"));  //fidTBU  --> file id To Be Updated
        if(nrname == orname){
            alert("Please enter a new name. This is the old name only.");
            return;
        }

        let alreadyExists = resources.some(f => f.rname == nrname && f.pid == cfid);
        if(alreadyExists == true){
            alert(nrname + " is already exists. Please try something new.");
            return;
        }
        
        divName.innerHTML = nrname; //Change in HTML

        //change in ram
        let resource = resources.find(f => f.rid == fidTBU);
        resource.rname = nrname;

        //change in storage
        saveToStorage();

    

    }

    function viewFolder(){
        let spanView = this;
        let divFolder = spanView.parentNode;
        divName = divFolder.querySelector("[purpose='name']");

        let fname = divName.innerHTML;
        let fid = parseInt(divFolder.getAttribute("rid"));

        let aPathTemplate = templates.content.querySelector("a[purpose='path']");
        let aPath = document.importNode(aPathTemplate, true);
        aPath.addEventListener("click", viewFolderFromPath);

        aPath.innerHTML = fname;
        aPath.setAttribute("rid", fid);
        
        divbreadCrumb.appendChild(aPath);
        cfid = fid;

        divContainer.innerHTML = "";
        for(let i = 0; i < resources.length; i++){
            if(resources[i].pid == cfid){
                if(resources[i].rtype == "folder"){
                    addFolderHTML(resources[i].rname, resources[i].rid, resources[i].pid);
                }else if(resources[i].rtype =="text-file"){
                    addTextFileHTML(resources[i].rname, resources[i].rid, resources[i].pid);
                }
            }
        }


        // console.log("In view");

    }

    function viewFolderFromPath(){
        let aPath = this;
        let fid = parseInt(aPath.getAttribute("rid"));

        //set the BreadCrumb.
        while(aPath.nextSibling){
            aPath.parentNode.removeChild(aPath.nextSibling);
        }

        //setting of divContainer.

        cfid = fid;
        divContainer.innerHTML = "";
        for(let i = 0; i < resources.length; i++){
            if(resources[i].pid == cfid){
                if(resources[i].rtype == "folder"){
                    addFolderHTML(resources[i].rname, resources[i].rid, resources[i].pid);
                }
                else if(resources[i].rtype == "text-file"){
                    addTextFileHTML(resources[i].rname, resources[i].rid, resources[i].pid);
                }
            }
        }


    }

    function viewTextFile(){
        let spanView = this;
        let divTextFile = spanView.parentNode;
        let divName = divTextFile.querySelector("[purpose='name']");
        let fname = divName.innerHTML;
        let fid = parseInt(divTextFile.getAttribute("rid"));

        let divNotepadMenuTemplate = templates.content.querySelector("[purpose='notepad-menu']");
        let divNotepadMenu = document.importNode(divNotepadMenuTemplate, true);
        divAppMenuBar.innerHTML = "";
        divAppMenuBar.appendChild(divNotepadMenu);

        let divNotepadBodyTemplate = templates.content.querySelector("[purpose='notepad-body']");
        let divNotepadBody = document.importNode(divNotepadBodyTemplate, true);
        divAppBody.innerHTML = "";
        divAppBody.appendChild(divNotepadBody);

        divAppTitle.innerHTML = fname;
        divAppTitle.setAttribute("rid", fid);

        let spanSave = divAppMenuBar.querySelector("[action='save']");
        let spanBold = divAppMenuBar.querySelector("[action='bold']");
        let spanItalic = divAppMenuBar.querySelector("[action='italic']");
        let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
        let inputBGColor = divAppMenuBar.querySelector("[action='bg-color']");
        let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
        let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
        let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
        let spanDownload = divAppMenuBar.querySelector("[action='download']");
        let inputUpload = divAppMenuBar.querySelector("[action='upload']");
        let textArea = divAppBody.querySelector("textArea");

        spanSave.addEventListener("click", saveNotepad);
        spanBold.addEventListener("click", makeNotepadBold);
        spanItalic.addEventListener("click", makeNotepadItalic);
        spanUnderline.addEventListener("click", makeNotepadUnderline);
        inputBGColor.addEventListener("change", changeNotepadBGColor);
        inputTextColor.addEventListener("change", changeNotepadTextColor);
        selectFontFamily.addEventListener("change", changeNotepadFontFamily);
        selectFontSize.addEventListener("change", changeNotepadFontSize);
        spanDownload.addEventListener("click", downloadNotepad);
        inputUpload.addEventListener("change", uploadNotepad);

        let resource = resources.find(r => r.rid == fid);
        spanBold.setAttribute("pressed", !resource.isBold);
        spanItalic.setAttribute("pressed", !resource.isItalic);
        spanUnderline.setAttribute("pressed", !resource.isUnderline);
        inputBGColor.value = resource.bgColor;
        inputTextColor.value = resource.TextColor;
        selectFontFamily.value = resource.fontFamily;
        selectFontSize.value = resource.fontSize;
        textArea.value = resource.content;

        spanBold.dispatchEvent(new Event("click"));
        spanItalic.dispatchEvent(new Event("click"));
        spanUnderline.dispatchEvent(new Event("click"));
        inputBGColor.dispatchEvent(new Event("change"));
        inputTextColor.dispatchEvent(new Event("change"));
        selectFontFamily.dispatchEvent(new Event("change"));
        selectFontSize.dispatchEvent(new Event("change"));

    }

    function downloadNotepad(){
        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.rid == fid);
        let divNotepadMenu = this.parentNode;

        let stringForDownload = JSON.stringify(resource);
        let encodedData = encodeURIComponent(stringForDownload);

        let aDownload = divNotepadMenu.querySelector("a[purpose='download']");
        aDownload.setAttribute("href", "data:text/json; charset=utf-8, " + encodedData);
        aDownload.setAttribute("download", resource.rname + ".json");

        aDownload.click();


    }

    function uploadNotepad(){
        let file = window.event.target.files[0];

        let reader = new FileReader();
        reader.addEventListener("load", function(){
            let data = window.event.target.result;
            let resource = JSON.parse(data);

            let spanBold = divAppMenuBar.querySelector("[action='bold']");
            let spanItalic = divAppMenuBar.querySelector("[action='italic']");
            let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
            let inputBGColor = divAppMenuBar.querySelector("[action='bg-color']");
            let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
            let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
            let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
            let textArea = divAppBody.querySelector("textArea");
            
            spanBold.setAttribute("pressed", !resource.isBold);
            spanItalic.setAttribute("pressed", !resource.isItalic);
            spanUnderline.setAttribute("pressed", !resource.isUnderline);
            inputBGColor.value = resource.bgColor;
            inputTextColor.value = resource.TextColor;
            selectFontFamily.value = resource.fontFamily;
            selectFontSize.value = resource.fontSize;
            textArea.value = resource.content;

            spanBold.dispatchEvent(new Event("click"));
            spanItalic.dispatchEvent(new Event("click"));
            spanUnderline.dispatchEvent(new Event("click"));
            inputBGColor.dispatchEvent(new Event("change"));
            inputTextColor.dispatchEvent(new Event("change"));
            selectFontFamily.dispatchEvent(new Event("change"));
            selectFontSize.dispatchEvent(new Event("change"));
        });

        reader.readAsText(file);
    }
    
    function saveNotepad(){
        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.rid == fid);

        let spanBold = divAppMenuBar.querySelector("[action='bold']");
        let spanItalic = divAppMenuBar.querySelector("[action='italic']");
        let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
        let inputBGColor = divAppMenuBar.querySelector("[action='bg-color']");
        let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
        let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
        let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
        let textArea = divAppBody.querySelector("textArea");

        resource.isBold = spanBold.getAttribute("pressed") == "true";
        resource.isItalic = spanItalic.getAttribute("pressed") == "true";
        resource.isUnderline = spanUnderline.getAttribute("pressed") == "true";
        resource.bgColor = inputBGColor.value;
        resource.TextColor = inputTextColor.value;
        resource.fontFamily = selectFontFamily.value;
        resource.fontSize = selectFontSize.value;
        resource.content = textArea.value;

        saveToStorage();

    }

    function makeNotepadBold(){
        let textArea = divAppBody.querySelector("textArea");
        let isPressed = this.getAttribute("pressed") == "true";
        if(isPressed == false){
            this.setAttribute("pressed", true);
            textArea.style.fontWeight = "bold";
        }else{
            this.setAttribute("pressed", false);
            textArea.style.fontWeight = "normal";
        }
        
    }

    function makeNotepadItalic(){
        let textArea = divAppBody.querySelector("textArea");
        let isPressed = this.getAttribute("pressed") == "true";
        if(isPressed == false){
            this.setAttribute("pressed", true);
            textArea.style.fontStyle = "italic";
        }else{
            this.setAttribute("pressed", false);
            textArea.style.fontStyle = "normal";
        }
        
    }

    function makeNotepadUnderline(){
        let textArea = divAppBody.querySelector("textArea");
        let isPressed = this.getAttribute("pressed") == "true";
        if(isPressed == false){
            this.setAttribute("pressed", true);
            textArea.style.textDecoration = "underline";
        }else{
            this.setAttribute("pressed", false);
            textArea.style.textDecoration = "none";
        }
        
    }

    function changeNotepadBGColor(){
        let color = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.backgroundColor = color;
        
    }

    function changeNotepadTextColor(){
        let color = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.color = color;
        
    }

    function changeNotepadFontFamily(){
        let fontFamily = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.fontFamily = fontFamily;
        
    }

    function changeNotepadFontSize(){
        let fontSize = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.fontSize = fontSize;
        
        
    }

    function saveToStorage(){
        let rjson = JSON.stringify(resources);  
        //stingify is used to convert jso into json string which can be saved.
        localStorage.setItem("data", rjson);


    }

    function loadFromStorage(){
        let rjson = localStorage.getItem("data");
        if(!!rjson){
            resources = JSON.parse(rjson);
            for(let i = 0; i < resources.length; i++){
                if(resources[i].pid == cfid){
                    if(resources[i].rtype == "folder"){
                        addFolderHTML(resources[i].rname, resources[i].rid, resources[i].pid);
                    }
                    else if(resources[i].rtype == "text-file")
                    {
                        addTextFileHTML(resources[i].rname, resources[i].rid, resources[i].pid);
                    }
                }
                if(resources[i].rid > rid){
                    rid = resources[i].rid;
                }
            }
        }

    }

    loadFromStorage();    
})();
//We use this IIFE to prevent namespace pollution.
