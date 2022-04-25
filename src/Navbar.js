import React from "react";

function Navbar(props) {
    return (
    <header className="App-header">
        <nav className="navbar navbar-dark bg-dark ">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">Clip Minter</span>
                <button id="walletButton" onClick={props.connect}>
                    {props.address.length > 0 ? (
                    "Connected: " +
                    String(props.address).substring(0, 6) +
                    "..." + String(props.address).substring(38)
                    ) : (<span>Connect Wallet</span>)}
                </button>
            </div>
        </nav>
    </header>
    )
}

export default Navbar