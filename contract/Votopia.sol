// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0<0.9.0;


/*
Functions of the voting dapp

1. It will accept proposal name, and number for tracking

2. allow for members to vote and exercise voting ability
    (keep track of voting, check if voters are authenticated to vote)

3.  There will be an authenticator to approve wallet to vote 

*/

contract Votopia {

    struct Voter {
        uint vote;
        bool anyvotes;
        uint value;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    Proposal[] public  proposals;

    mapping (address => Voter) public voters;

    address public authenticator;

    bool public votingClosed;



    constructor (bytes32[] memory proposalNames) {
        authenticator = msg.sender;

        voters[authenticator].value = 1;

        for (uint i=0; i<proposalNames.length; i++){
            proposals.push(Proposal({
                name:proposalNames[i],
                voteCount: 0
            }));
        }
    }

    modifier votingPeriod(){
        require(!votingClosed, "Voting period is over");
        _;
    }

    // function to authenticate votes
    function giveRightToVote(address voter) public {
        require(msg.sender == authenticator, "Only the authenticator gives access to vote");
        
        // require voter has not voted

        require(!voters[voter].anyvotes, "The voter has already voted");
        require(voters[voter].value == 0, "The voter has been authenticated");

        voters[voter].value = 1;
    }

    // function for voting

    function vote(uint proposal) public  {
        Voter storage sender = voters[msg.sender];
        require(sender.value != 0, "Has no right to vote");

        require(!sender.anyvotes, "Already voted");
    
        sender.anyvotes = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.value;

    }

    function closeVote() public {
        require(msg.sender == authenticator, "Only the authenticator can close the voting period");
        votingClosed = true;
    }

    // function for showing results 

    // 1. function that shows the winning proposal by integer

    function winningProposal() public view returns(uint winningProposal_) {
       uint winningVoteCount = 0;
       for(uint i=0; i < proposals.length; i++){
           if(proposals[i].voteCount > winningVoteCount){
               winningVoteCount = proposals[i].voteCount;

               winningProposal_ = i;
           }
       } 
    }

    // function that shows the winner by name

    function winningName() public view returns (bytes32 winningName_){
        winningName_ = proposals[winningProposal()].name;
    }
}