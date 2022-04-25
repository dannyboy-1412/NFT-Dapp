import React,{useState,useEffect} from "react";

import NftContract from "./artifacts/contracts/Nft.sol/MyNFT.json";
import './App.css';
import Navbar from "./Navbar";
import { ethers } from "ethers";

//pinata imports
const axios = require('axios');
//const fs = require('fs');
const FormData = require('form-data');
const pinataApiKey = process.env.REACT_APP_PINATA_KEY
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET



function App() {
  const [walletAddress,setWalletAddress] = useState('');
  const [title,setTitle] = useState('');
  const [image,setImage] = useState();

  //Contract Address
  const CONTRACT_ADDRESS = "0x200fE0600bc310018696c016277dA3Bf9C767e73";
  
  //Connect Wallet to the dapp
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(addressArray[0]);
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("Please Install Metamask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_accounts",
        });
        if(addressArray.length>0){
          setWalletAddress(addressArray[0]); 
        } else {
          setWalletAddress("");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("Please Install Metamask");
    }
  };

  const onFileChange = (event) => {
    setImage(event.target.files[0]);
  }

  const onFileUpload =async () => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append('file', image);

    const fileResponse  = await axios.post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
    const { data: fileData = {} } = fileResponse;
    //const { IpfsHash } = fileData;
    const fileIPFS= `https://gateway.pinata.cloud/ipfs/${fileData.IpfsHash}`;
    console.log(fileIPFS)

    const metadata = {
      name: title,
      description: "Danny NFT",
      image: "/ipfs/"+fileData.IpfsHash,
    };   
    const pinataJSONBody = {
      pinataContent: metadata 
    };
    const jsonResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", pinataJSONBody, {
        headers: {
          'Content-Type': `application/json`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
        },
    });
    const { data: jsonData = {} } = jsonResponse;
    const { IpfsHash } = jsonData;
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log(tokenURI);

    try{
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS,NftContract.abi,signer);

        const txn = await contract.mintNFT(tokenURI);
        await txn.wait();
        setTitle('');
        setImage('');
        console.log('The Transaction hash: ',txn.hash);
        console.log(txn);
        document.getElementById('success').innerHTML = `NFT MInted Congratulations!!`
  
      } else {
        alert("Install Metamask")
        return;
      }

    } catch(err) {
      console.log(err);
    }
};



  useEffect(() => {
    getCurrentWalletConnected();
  },[]);

  return (
    <div className="App">
      <Navbar address={walletAddress} connect={connectWallet}/>
      <div className="container-lg">
        <h1>Save Your Clip In The Bockchain</h1>

        <input className="form-control form-control-lg" type="text" placeholder="Enter Name" value={title} onChange={(e) => setTitle(e.target.value)}></input>
        <input className="form-control form-control-lg" id="formFileLg" type="file" onChange={onFileChange}/>
        <button className="btn btn-success" id="button" onClick={onFileUpload}>Mint</button> 

        <div id="success"></div>
        
      </div>
      
    </div>
  );  
}

export default App;
