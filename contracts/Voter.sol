pragma solidity ^0.4.24;

contract Voting {
  event AddedCandidate(uint candidateId);

  struct Voter {
    bytes32 uid;
    uint candidateIDVote;
  }

  struct Candidate {
    bytes32 name;
    bytes32 party;
    bool doesExist;
  }

  uint numberOfCandidates;
  uint numberOfVoters;

  mapping (uint => Candidate) candidates;
  mapping (uint => Voter) voters;

  function addCandidate(bytes32 _name, bytes32 _party) public {
    uint candidateId = numberOfCandidates++;
    candidates[candidateId] = Candidate(_name, _party, true);
    AddedCandidate(candidateId);
  }

  function vote(bytes32 _uid, uint _candidateID) public {
    if (candidates[_candidateID].doesExist == true) {
      uint voterID = numberOfVoters++;
      voters[voterID] = Voter(_uid, _candidateID);
    }
  }
}