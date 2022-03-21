// Before any of our JavaScript can function, it should be in a "device ready" function
// that Cordova detected all foundational elements have been loaded
// Listen for the moment all your files load into memory,
// Then run the main function "onDeviceReady()"
document.addEventListener("deviceready", onDeviceReady, false);

// All future JS code MUST be in the onDeviceReady main funciton!
function onDeviceReady() {
  console.log("Cordova is ready!"); 
  // ------------- Variables ------------------ //
  // Containers for data
  /* Create Variables for the Sign Up/Log In Forms, and the Log Out Button */
  // var - classic way. Still works
  // let - newer way; recommended way to create an Object that varies
  // const - newer way; recommended way to create an Object that does not vary
  // document.getElementById("fmSignUp") - means find an HTML Element with that ID -- pJS
  // $("#fmSignUp") - means find an HTML Element with that ID                      -- jQuery
  // Any Variables created OUTSIDE of an app are Global Scope Varialables and can be used
  //   anywhere in the app when needed. Always loaded in memory. 
  // Versus any Variables created INSIDE a Function only exist (and take up memory)
  //   while the app is running, but can only be used, as THAT Function running
  
  const $elFmSignUp = $("#fmSignUp"),
        $elFmLogIn = $("#fmLogIn"),
        $elBtnLogOut = $("#btnLogOut"); 
  // New Variable for the Pattern of a Strong Password
  let strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#%&])(?=.{7,})");
  // Variable to keep track of who is logged in; make sure to setItem("whoIsLoggedIn") later in the code 
  let uid = localStorage.getItem("whoIsLoggedIn");
  // Variable (aka Object) that represents our PouchDB Database; note the 'internal' name vs 'external' name
  // new PouchDB() will either create a new Database (empty) or 
  // a new connection to an existing Database (open it to use)
  // let DB = new PouchDB("comics"); // OLD
  // Instead of one Database for all, create an uninitialized Db to be used for each user
  let DB;                   // <--Techinically, an undefined variable

  // Variables for the Save comic form
  const $elFmSaveComic = $("#fmSaveComic");

  // Variable to delete the whole Database
  const $elBtnDeleteCollection = $("#btnDeleteCollection");

  // Variable to keep track of which comic we're viewing/editing
  let comicWIP = "";        // <--Technically an empty variable as a String

  // Variable for the take a photo button
  const $elBtnTakePhoto = $("#btnTakePhoto");

  // ------------- Functions ------------------- //
  // The subroutines (bundles of code) that accomplish a task   

  // Function to create or Loads a database, based on email
  function fnInitDB() {
    console.log("fnInitDB() is running");
    // Get the current user's email, to make their database  // Not UID because we need to keep checking every time
    let emailForDB = localStorage.getItem("whoIsLoggedIn");
    // Now create a Database (or open exisiting one) based on that email
    DB = new PouchDB(emailForDB);
    console.log("Their database: " + DB);
    // Return the variable for all the app to use
    return DB;
  } // END fnInitDB()

  // Auto-login code could be in a Function, but will be added 'raw'
  // so it runs right away at the launch of the app
  // To mean "or" in a condtiional statement, use two Pipe characters: ||
  if(uid === "" || uid === null || uid === undefined || uid === false) {
    console.log("No one logged in. Keep them at #pgWelcome");
  } else {
    console.log(uid + " logged in. Move them to #pgHome");
    $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
    // Load that user's database
    fnInitDB();
    // Load their first comics
    fnViewComics();
    // id and #  the same; class and . the same
    // At all <h4> with that Class, set their email
    $(".userEmail").html("Hello " + uid); // Say hello to that user...
  } // END If..Else to check whoIsLoggedIn (Auto-login code)

  // Create a function to do all the steps signing up for an account
  function fnSignUp(event) { 
    // Prevent the default event of refreshing the screen
    event.preventDefault();
    console.log("fnSignUp(event) is running!");

    // Create variables to read the <input>s of this <form>
    let $elInEmailSignUp = $("#inEmailSignUp"),
        $elInPasswordSignUp = $("#inPasswordSignUp"),
        $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");

        // Quick test to read what's in the box
        console.log($elInEmailSignUp.val(), $elInPasswordSignUp.val(), $elInPasswordConfirmSignUp.val());

        // Before we compare if PWDs match, check if their provided PWD matches the strongPassword
        if(strongPassword.test($elInPasswordSignUp.val())) {
          console.log("Yes, password is strong");
          // Strong enough, so,proceed to check if PWD match, and then store the user

                  // Check if the Password and Confirm Password match, via Conditional Statements
                  if($elInPasswordSignUp.val() != $elInPasswordConfirmSignUp.val()) {
                    // Deal with Passwords NOT matching...
                    console.log("PWDs DON'T match!");
                    // Let the User know, via popup
                    window.alert("Passwords don't match!");
                    // Clear the Password fields to try again
                    $elInPasswordSignUp.val("");
                    $elInPasswordConfirmSignUp.val("");
                  } else {
                    // Deal with Passwords THAT DO match...
                    console.log("PWDs DO MATCH!");
                    // Use localStorage to save the user data, as a new account
                    // localStorage.setItem("memorylocation", "data");
                    // localStorage.setItem("user1", "vcampos@sdccd.edu / kittycat");
                    // localStorage.setItem("VCAMPOS@SDCCD.EDU", "kittycat");
                    // Capitalization matters, so try to simplify when possible
                    let $tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                        $tmpValInPasswordSignUp = $elInPasswordSignUp.val();

                    // Before saving to the localStorage, check if tthey've been saved before
                    if(localStorage.getItem($tmpValInEmailSignUp) === null) {
                      console.log("New User detected!");

                      // So, store the new user
                      localStorage.setItem($tmpValInEmailSignUp, $tmpValInPasswordSignUp);
                      // Then clear the form, for the next user
                      $elFmSignUp[0].reset();
                      // Welcome the user
                      window.alert("Welcome to CBDB!");
                      console.log("New user saved: " + $tmpValInEmailSignUp);
                      // Move them to #pgSignUp
                      $(":mobile-pagecontainer").pagecontainer("change", "#pgSignUp");
                    } else {
                      console.log("Previous User detected");
                      window.alert("You already have an account!");
                    } // END If..Else for new/old user checking
                  } // END If..Else password confirm checker
        } else {
          console.log("NO, password is not strong");
          window.alert("Password not strong enough!");
        } // END If..Else StrongPassword Checker
  } // END fnSignUp(event)

  // Function for logging in to an account
  function fnLogIn() {
    event.preventDefault();
    console.log("fnLogIn() is running");

    // Create variables (objects) for the inputs, and  read their values
    let $elInEmailLogIn = $("#inEmailLogIn"),
        $elInPasswordLogIn = $("#inPasswordLogIn"),
        $tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
        $tmpValInPasswordLogIn = $elInPasswordLogIn.val();

    console.log($tmpValInEmailLogIn, $tmpValInPasswordLogIn);

    // Conditional Statement to check if account was previously created
    if(localStorage.getItem($tmpValInEmailLogIn) === null) { 
      console.log("Account does NOT exist!");
      window.alert("Account does NOT exist!");
    } else {
      console.log("Account DOES EXIST!");

      // Conditional Statement to check if current password matches saved password
      if($tmpValInPasswordLogIn === localStorage.getItem($tmpValInEmailLogIn)) { 
        console.log("Passwords DO MATCH");
        // So move them to #pgHome with this jQM specific code
        $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
        // Set whoIsLogged in to start keeping track of last login
        localStorage.setItem("whoIsLoggedIn", $tmpValInEmailLogIn);
        // Load that user's database
        fnInitDB();
        // Load their first comics
        fnViewComics();
        $(".userEmail").html("Hello " + $tmpValInEmailLogIn); // But use CURRENT email
      } else {
        console.log("Passwords do NOT match");
        window.alert("Password does not match!");
      } // END If..Else checking for password match
    } // END If..Else checking for account
  } // END fnLogIn()

  // Function to log out the user
  function fnLogOut() {
    console.log("fnLogOut() is running");

    // Conditional Statement to confirm if they really wish to log out
    switch(window.confirm("Do you want to log out?")) {
      case true:
        console.log("They DO WANT to log out");
        // So move them to #pgWelcome
        $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome");
        // And clear any <form> for a new user
        $elFmSignUp[0].reset();
        $elFmLogIn[0].reset();
        // Now set "whoIsLoggedIn" to "no one"
        // Make sure NO space!
        localStorage.setItem("whoIsLoggedIn", "");
        break;
      case false:
        console.log("They do NOT want to log out");
        break;
      case "Maybe":
        console.log("Might want to log out");
        break;
      default:
        console.log("Unknown");
        break;
    } // END switch() to log out
  } // END FnLogOut()

  // Function to prepare the data to save
  function fnPrepComic() {
    console.log("fnPrepComic() is running");

    // Read all the fields in <form>
    let $valInTitleSave = $("#inTitleSave").val(),
        $valInNumberSave = $("#inNumberSave").val(),
        $valInYearSave = $("#inYearSave").val(),
        $valInPublisherSave = $("#inPublisherSave").val(),
        $valInNotesSave = $("#inNotesSave").val();
    // Read the path to the photo
    let $valInPhotoSave = $("#inPhotoSavePath").val();

    // Take all that separate data and bundle it in JSON format
    let tmpComic = {
      "_id" : $valInTitleSave.replace(/\W/g,"") + $valInYearSave + $valInNumberSave,
      "title" : $valInTitleSave,
      "number" : $valInNumberSave,
      "year" : $valInYearSave,
      "publisher" : $valInPublisherSave,
      "notes" : $valInNotesSave,
      "photo" : $valInPhotoSave
    }; // END of JSON bundle
      // DON'T FORGET THE NEW COMMA AFTER NOTES!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Return this bundle to any other subroutine asking for it
    return tmpComic;
  } // END fnPrepComic()

  // Function for saving a comic
  function fnSaveComic(event) {
    event.preventDefault();
    console.log("fnSaveComic(event) is running");

    // Get a comic
    let aComic = fnPrepComic();

    // See it
    console.log("Comic about to save: " + aComic._id);

    // Save data to the database
    DB.put(aComic, function(failure, success){ 
      // Deal with a failure or success
      if(failure) { 
        console.log("Error: " + failure.message);
        // Version 1: assuming the comic is already saved. V2: add option for saving another copy, etc
        window.alert("Comic already saved!");  
      } else {
        console.log("Saved the comic: " + success.ok);
        window.alert("Comic saved!");
        // Clear the form after saving
        $elFmSaveComic[0].reset();
        // Re-hide the <img> so a new image can be snapped
        $("#inPhotoSaveImg").hide();
        // Refresh pgViewcomics
        fnViewComics();
      }
    }); // END .put()
  } // END fnSaveComic(event)

  // Function to retrieve the comics and show them
  function fnViewComics() {
    console.log("fnViewComics() is running");

    // Get all currently saved comics so we can display on screen, .allDocs()
    // ascending will alphabetize the comics; include_docs will also get the title, publisher, year, etc
    // by default .allDocs() only gets the _id of the entry
    DB.allDocs({"ascending" : true, "include_docs" : true}, 
      function(failure, success){
        if(failure) {
          console.log("Failure getting data: " + failure);
        } else {
          // If no comics, show a message
          if(success.rows[0] === undefined) {
            $("#divViewComics").html("No comics, yet!");
            console.log("No comics, yet!"); 
          } else {
            // Show how many comics saved so far
            console.log("Success getting data: " + success.rows.length);
            // Show the first comic in the database
            console.log(success.rows[0].doc._id);

            // Prepare a <table> of our comic data, then show it onscreen
            let comicData = "<table> <tr> <th>Title</th> <th>#</th> <th>Year</th> </tr>";

            // For Loop to iterate x number of times, based on how many comics in the Database
            for(let i = 0; i < success.rows.length; i++) { 
              // DON'T FORGET TO ADD  +=      NOT JUST   =   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              // To each row, add a Class so JS can detect a click
              // and attach the _id to each, so JS differentiates each one
              comicData += "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'> <td>" + 
                success.rows[i].doc.title + 
                "</td> <td>" + success.rows[i].doc.number + 
                "</td> <td>" + success.rows[i].doc.year + 
                "</td> </tr>";
            } // END For Loop

            // DON'T FORGET TO ADD +=      NOT JUST   =   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            comicData += "</table>";

            // Show the <table> in the waiting <div>
            $("#divViewComics").html(comicData);
          } // END If..Else for data checking
        } // END If..Else .allDocs()
      }); // END .allDocs()
  } // END fnViewComics()

  function fnDeleteCollection() {
    console.log("fnDeleteCollection() is running");
    // Confirm deletion of the database, first
    if(window.confirm("Are you sure you wish to delete your collection?")) {
      console.log("They do wish to delete. Ask one more time...");
        if(window.confirm("Are you sure? There is NO undo!")) {
          console.log("Second confirm deletion!");
          // Now delete (.destroy() the database and refresh the screen)
          DB.destroy(function(failure, success){
            if(failure) {
              console.log("Error in delete database " + failure.message);
            } else {
              console.log("Database deleted: " + success.ok);
              fnInitDB(); 
              // Refresh pgView
              fnViewComics();
              // Give the user feedback
              window.alert("All comics are gone! Save some more");
            } // End If..Else of .destroy()
          }); // END .destroy()
        } else {
          console.log("They actually don't want to delete");
        } // END second If..Else to confirm deletion
    } else {
      console.log("They DO NOT want to delete the DB");
    } // END If..Else confirm deletion of DB
  } // END fnDeleteCollection()

  // Function to start the edit process (will load details) makes the popup
  function fnEditComic(thisComic) {
    // Display the _id of the comic you clicked
    console.log("fnEditComic(thisComic) is running: " + thisComic.context.id); 
    // Get the comic's details from the database 
    DB.get(thisComic.context.id, function(failure, success){
      if(failure) {
        console.log("Error getting the comic: " + failure.message);
      } else {
        console.log("Success getting the comic: " + success.title);
        // Populate the empty <input> fields in #pgComicViewEdit with this comic data
        $("#inTitleEdit").val(success.title);
        $("#inNumberEdit").val(success.number);
        $("#inYearEdit").val(success.year);
        $("#inPublisherEdit").val(success.publisher);
        $("#inNotesEdit").val(success.notes);
        // Before popluating any <img> elements, check for photo
        if(success.photo === undefined) {
          console.log("No photo");
          $("#inPhotoEditPath").hide();
          $("#inPhotoEditImg").hide();
        } else {
          console.log("Current photo: " + success.photo);
          $("#inPhotoEditPath").val(success.photo);
          $("#inPhotoEditImg").attr("src", success.photo);
          $("#inPhotoEditPath").show();
          $("#inPhotoEditImg").show();
        } // END photo
        // Show the picture....
        // Set comicWIP to this comic we clicked on
        comicWIP = success._id;
      } // END If..Else .get()
    }); // END .get()

    // Now load the pgComicViewEdit screen is a POPUP (dialog box); note the JSON-formated Options
    $(":mobile-pagecontainer").pagecontainer("change", "#pgComicViewEdit", {"role":"dialog"});
  } // END fnEditComic(thisComic)

  // Function to close the popup
  function fnEditComicCancel() {
    console.log("fnEditComicCancel() is running");
    $("#pgComicViewEdit").dialog("close");
  } // END fnEditcomicCancel()

  // Function to confirm updates to a comic
  function fnEditComicConfirm(event) {
    event.preventDefault(); // Stop the refresh
    console.log("fnEditComicConfirm(event) is running: " + comicWIP);

    // Re-read each <input> (no matter if it was updated or not) to re-save the the database
    let $valInTitleEdit     = $("#inTitleEdit").val(),
        $valInNumberEdit    = $("#inNumberEdit").val(),
        $valInYearEdit      = $("#inYearEdit").val(),
        $valInPublisherEdit = $("#inPublisherEdit").val(),
        $valInNotesEdit     = $("#inNotesEdit").val(),
        $valInPhotoEdit     = $("#inPhotoEditPath").val();

    console.log($valInTitleEdit, $valInNumberEdit, $valInYearEdit, $valInPublisherEdit, $valInNotesEdit, $valInPhotoEdit);

    // Get the current version of the data, so we can update it to the next version 
    DB.get(comicWIP, function(failure, success){
      if(failure) {
        console.log("Erro: " + failure.message);
      } else {
        console.log("About to update: " + success._id);
        // Does exist in the database, so reinsert in the same _id, but with a new _rev (revision)
        DB.put({
          "_id" : success._id,
          "title" : $valInTitleEdit,
          "number" : $valInNumberEdit,
          "year" : $valInYearEdit,
          "publisher" : $valInPublisherEdit,
          "notes" : $valInNotesEdit,
          "photo" : $valInPhotoEdit,
          "_rev" : success._rev
        }, function(failure, success){
          if(failure) {
            console.log("Error: " + failure.message);
          } else {
            console.log("Success Updated comic: " + success.id); // Note NOT ._id but instead .id
            fnViewComics() // Refresh the pgView screen
            $("#pgComicViewEdit").dialog("close"); // Close this popup
          } // END If..Else .put()
        }); // END .put()  
      } // END If..Else of .get()
    }); // END .get()
  } // END fnEditComicConfirm(event)

  // Function to delete one comic
  function fnEditComicDelete() {
    console.log("fnEditComicDelete() is running");

    // Get the comic to delete, first
    DB.get(comicWIP, function(failure, success){
      if(failure) {
        console.log("Error: " + failure.message);
      } else {
        console.log("Deleting: " + success._id);
        // Confirm deletion
        if( window.confirm("Are you sure you want to delete this comic?") ) {
          console.log("They DO want to delete");
          // Run .remove() and deal with success/failure
          DB.remove(success, function(failure, success){
            if(failure) {
              console.log("Couldn't delete comic: " + failure.message);
            } else {
              console.log("Deleted the comic: " + success.ok);
              fnViewComics(); // Refresh comic table
              $("#pgComicViewEdit").dialog("close"); // Close this popup
            } // END If..Else .remove()
          }); // END .remove()
        } else {
          console.log("They do NOT want to delete");
        } // If..Else confirm deletion
      } // END If..Else .get()
    }); // END .get()
  } // END fnEditComicDlete

  // Function to acces Cordova Camera Plugin (API)
  function fnTakePhoto() {
    console.log("fnTakePhoto() is running");

    // Cordova code to access the camera
    navigator.camera.getPicture(
      function(success){
        console.log("Got photo: " + success);
        $("#inPhotoSavePath").val(success);
        $("#inPhotoSaveImg").attr("src", success);
        $("#inPhotoSaveImg").show();
      },
      function(failure) { 
        console.log("Photo failure: " + failure); 
        },
      { 
        "quality" : 10, 
        "saveToPhotoAlbum" : true, 
        "targetWidth" : 100, 
        "targetHeight" : 100 
        } 
    ); // END .getPicture()
  } // END fnTakePhoto()

  // ------------- Event Listeners ------------- //
  // Detecting interaction
  
  // Wait for "submit" button pressed in the fmSignUp <form>
  // then run a function called fnSignUp(), capture the default event, pas it thru
  $elFmSignUp.submit(function(){ fnSignUp(event); });
  $elFmLogIn.submit( function(){ fnLogIn(event); } );
  // Note: this Event Listener is NOT tied to a <form> so it's different
  $elBtnLogOut.on("click", fnLogOut);
  // Event listener on the save comic form (remember the (event)
  $elFmSaveComic.submit(function(){fnSaveComic(event);});
  // Event Listner for deleteing the database
  $elBtnDeleteCollection.on("click", fnDeleteCollection);
  // Note, no const created at the top of the code, first. A quick n dirty way to do the same:
  //   detect when Submit button is pressed on the Edit screen
  $("#fmEditComicInfo").submit(function(){fnEditComicConfirm(event);});
  // Detect the Cancel button on the Edit screen, to close that popup
  $("#btnEditComicCancel").on("click", fnEditComicCancel);
  // Detect clicking on any comic in a row, and passing into the Function, WHICH comic you clicked
  $("#divViewComics").on("click", "tr.btnShowComicInfo",function(){  fnEditComic( $(this)  );  }     );
  // Detect clicking on delete the one comic
  $("#btnDeleteComic").on("click", fnEditComicDelete);
  // Start the Cordova Camera plugin after tapping the (generic) Snap Photo button
  $elBtnTakePhoto.on("click", fnTakePhoto);
} // END onDeviceReady()


/*
    Name: Victor Campos <vcampos@sdccd.edu>
    Project: CBDB (The Comic Book Database)
    Version: 1.0
    Date: 2022-01-20
    Notes: App to store, load, edit comic entries, for different users.
*/