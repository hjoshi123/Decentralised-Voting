// import CSS. Webpack with deal with it
import "../css/style.css";

// Import libraries we need.
import { default as Web3} from "web3";
import { default as contract } from "truffle-contract";
import votingArtifacts from "../../build/contracts/Voting.json";
let VotingContract = contract(votingArtifacts);

window.App = {
  start: function() {
    VotingContract.setProvider(window.web3.currentProvider);
    VotingContract.defaults({from: window.web3.eth.accounts[0], gas: 6721975});

    VotingContract.deployed().then(function(instance){
      instance.getNumOfCandidates().then(function(numberOfCandidates){
        if (numberOfCandidates == 0) {
          let candidates = ["Narendra Modi", "Rahul Gandhi", "Mamata Banerjee"],
            party = ["BJP", "Congress", "TMC"];
          for (let i = 0; i < candidates.length; i++) {
            instance.addCandidate(candidates[i], party[i]).then(function(result){ 
              $("#candidate-box").append(`<div class='form-check'><input class='form-check-input' type='checkbox' value='' id=${result.logs[0].args.candidateID}><label class='form-check-label' for=0>${candidates[i]} - ${party[i]}</label></div>`);
            });
          }
          // the global variable will take the value of this variable
          numberOfCandidates = candidates.length;
        } else {
          for (let i = 0; i < numberOfCandidates; i++) {
            instance.getCandidate(i).then(function(data){
              $("#candidate-box").append(`<div class="form-check"><input class="form-check-input" type="checkbox" value="" id=${data[0]}><label class="form-check-label" for=${data[0]}>${window.web3.toAscii(data[1])} - ${window.web3.toAscii(data[2])}</label></div>`)
            });
          }
        }
        window.numberOfCandidates = numberOfCandidates;
      });
    }).catch(function(err){
      console.error("Error!" + err.message);
    });
  },

  vote: function() {
    let uid = $("#id-input").val();
    if (uid == "") {
      $("#msg").html("<p>Please enter id</p>");
      return;
    }
    if ($("#candidate-box :checkbox:checked").length > 0){ 
      // just takes the first checked box and gets its id
      var candidateID = $("#candidate-box :checkbox:checked")[0].id;
      console.log("Hello "+candidateID);
    } 
    else {
      // print message if user didn't vote for candidate
      $("#msg").html("<p>Please vote for a candidate.</p>");
      return;
    }
    // Actually voting for the Candidate using the Contract and displaying "Voted"
    VotingContract.deployed().then(function(instance){
      instance.vote(uid,parseInt(candidateID)).then(function(result){
        $("#msg").html("<p>Voted</p>");
      });
    }).catch(function(err){ 
      console.error("ERROR! " + err.message);
    });
  },

  findNumOfVotes: function() {
    VotingContract.deployed().then(function(instance){
      // this is where we will add the candidate vote Info before replacing whatever is in #vote-box
      var box = $("<section></section>") ;

      // loop through the number of candidates and display their votes
      for (var i = 0; i < window.numberOfCandidates; i++){
        // calls two smart contract functions
        var candidatePromise = instance.getCandidate(i);
        var votesPromise = instance.totalVotes(i);

        // resolves Promises by adding them to the variable box
        Promise.all([candidatePromise, votesPromise]).then(function(data){
          box.append(`<p>${window.web3.toAscii(data[0][1])}: ${data[1]}</p>`);
        }).catch(function(err){ 
          console.error("ERROR! " + err.message);
        });
      }
      $("#vote-box").html(box); // displays the "box" and replaces everything that was in it before
    });
  }
};

// When the page loads, we create a web3 instance and set a provider. We then set up the app
window.addEventListener("load", function() {
  // Is there an injected web3 instance?
  if (typeof web3 !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask");
    // If there is a web3 instance(in Mist/Metamask), then we use its provider to create our web3object
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
  }
  // initializing the App
  window.App.start();
});