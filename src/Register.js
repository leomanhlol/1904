import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('/my_view/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ my_data: formData })
    })
    .then(response => response.json())
    .then(data => setResponse(data))
    .catch(error => console.error(error));
  }

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  return (
    <div className="col-lg-7 col-md-6 mb-lg-0 mb-4">
                <div className="card bg-gradient-dark">
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-lg-12">
                        <form onSubmit={handleSubmit}>
                        <div className="d-flex flex-column h-100">
                          <h2
                            className="col-lg 5 font-weight-bolder mb-4"
                            style={{ color: "black" }}
                          >
                            BUY AND INVEST WITH US
                          </h2>
                          <div className="input-group has-success mb-3">
                            <span className="input-group-text">
                              Enter BNB Orders
                            </span>
                            <input
                              id="buyinput"
                              type="text"
                              placeholder="0.1"
                              defaultValue="0.1"
                              required="required"
                              className="input-bordered-presale"
                              onfocus="focused(this)"
                              onfocusout="defocused(this)"
                            />
                          </div>
                          <select class="input-bordered-presale"><option value="">-- PLEASE CHOOSE PACKAGE --</option><option class="option" value="90 DAYS">Package 1: GOLD</option><option class="option" value="150 DAYS">Package 2: RUBY</option><option class="option" value="180 DAYS">Package 3: PLATINUM</option><option class="option" value="240 DAYS">Package 4: SAPPHIRE</option><option class="option" value="300 DAYS">Package 5: DIAMOND</option><option class="option" value="360 DAYS">Package 6: DOUBLE DIAMOND</option></select>
                          <div className="view-buy other_btn">
                            <center>
                              {/* <a
                                id="airbtn"
                                href="javascript:void(0)"
                                className="btn btn-info btn-auto btn-md"
                                onClick={() => buyCoin()}
                              >
                                BUY AND INVEST
                              </a> */}
                              <input type="submit" className="btn btn-info btn-auto btn-md" value="BUY AND INVEST"></input>
                              <a
                                href="javascript:void(0)"
                                id="airbtn"
                                className="btn btn-info btn-auto btn-md"
                                onClick={() => addTokenToWallet()}
                              >
                                Add Token to Wallet
                              </a>
                              <input
                                style={{ display: "none" }}
                                id="buyainput"
                                type="text"
                                className="input-bordered"
                                required="required"
                                placeholder="0.001"
                                defaultValue="0.001"
                              />
                              <br />
                              <p className="card__description">
                                {" "}
                                (Please Connect to Binance Smart Chain first.)
                              </p>

                              <input
                                style={{
                                  display: "none",
                                  width: "100%",
                                  color: "beige",
                                  marginTop: "10px",
                                  marginBottom: "10px",
                                  padding: "5px",
                                  textAlign: "center",
                                  backgroundImage:
                                    "linear-gradient(to left, #d565b0, #5b6de8, #ff937b, #ce62b6)"
                                }}
                                id="buyinputone"
                                type="text"
                                className="input_airdrop"
                                required="required"
                                placeholder="0.002"
                                defaultValue="0.002"
                              />
                              {/* <a href="javascript:void(0)" id="airbtn" onclick="buyair()" className="btn btn-md btn-auto btn-grad no-change">Claim 3,000,000
                                $BNBK</a> */}
                            </center>
                          </div>
                          {/* <div className="mt-6">
                            <p className="text-info">
                              (*) Fee Claim: 0.0002 BNB<br />
                              (*) Rate Sale: 0.01 BNB = 415.000 BNBK<br />
                              (*) Minium buy 0.01 BNB - 10 BNB<br />
                            </p>
                          </div> */}
                        </div></form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  );
}
export default Register;