
import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({ wallet_address: '', amount: '', pack: '' });
  const [response, setResponse] = useState(null);
  const address = '0x4377B048f6C8529b2c58dddeC5f100b8e96a5a5B'
  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:8000/api/list/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => setResponse(data))
    .catch(error => console.error(error));
  }

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  return (
    <div className="card bg-gradient-light">
        <div className="col-lg-7 col-md-6 mb-lg-0 mb-4">
                <div className="card bg-gradient-light">
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-lg-12">
                      <h2
                            className="col-lg 5 font-weight-bolder mb-4"
                            style={{ color: "black" }}
                          >
                            BUY AND INVEST WITH US
                          </h2>
      <form onSubmit={handleSubmit}>
        <label style={{ color: "black" }}>
          Wallet Address:
          <input placeholder={address} type="text" name="wallet_address" value={formData.wallet_address} onChange={handleChange} />
        </label>
        <br />
        <label style={{ color: "black" }}>
          Amount:
          <input type="text" name="amount" value={formData.amount} onChange={handleChange} />
        </label>
        <br />
        <label style={{ color: "black" }}>
          Package:
          <select name="pack" value={formData.pack} onChange={handleChange}>
            <option value="">-- PLEASE CHOOSE PACKAGE --</option>
            <option value="90 DAYS">Package 1: GOLD</option>
            <option value="150 DAYS">Package 2: RUBY</option>
            <option value="180 DAYS">Package 3: PLATINUM</option>
            <option value="240 DAYS">Package 4: SAPPHIRE</option>
            <option value="300 DAYS">Package 5: DIAMOND</option>
            <option value="360 DAYS">Package 6: DOUBLE DIAMOND</option>
          </select>
        </label>
        <br />
        <input type="submit" value="Submit" className="btn btn-md btn-auto btn-grad no-change" />
      </form>
      <a
                                href="javascript:void(0)"
                                id="airbtn"
                                className="btn btn-info btn-auto btn-md mt-3"
                                onClick={() => addTokenToWallet()}
                              >
                                Add Token to Wallet
                              </a>
      {response && <p>Response: {JSON.stringify(response)}</p>}
    </div></div></div></div></div></div>
  );
}

export default Register;


 