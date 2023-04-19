import React from "react";
import "./Home.css";
import team1 from "./images/1.png";
import team2 from "./images/2.png";
import team3 from "./images/3.png";
import team4 from "./images/4.png";
import team5 from "./images/5.png";
import team6 from "./images/6.png";

export default function Team() {
  return (
    <div>
      <div>
        <div className="container text-center mt-5 mb-2">
          <h1 className="teamtitle mb-0"></h1>
          <span></span>
        </div>
        <div className="container mt-3">
          <div className="row">
            <div className="col-md-3 ">
              <div className="team bg-black p-3 text-center -">
                <img
                  className="img-responsive rounded-circle"
                  src={team1}
                  width={90}
                />
                <h5 className="mt-3 name">Caradoc Doris</h5>
                <span className="work d-block">MARKETING DIRECTOR</span>
                <span className="work d-block"></span>

                <div className="mt-4">
                  <button href="#" className="v-profile btn btn-md btn-grad">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team bg-black p-3 text-center box">
                <img
                  className="img-responsive rounded-circle"
                  src={team2}
                  width={90}
                />
                <h5 className="mt-3 name">Jonathan Muriel</h5>
                <span className="work d-block">CEO</span>
                <span className="work d-block"></span>

                <div className="mt-4">
                  <button href="#" className="v-profile btn btn-md btn-grad">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team bg-black p-3 text-center box">
                <img
                  className="img-responsive rounded-circle"
                  src={team3}
                  width={90}
                />
                <h5 className="mt-3 name">Raymond Roy</h5>
                <span className="work d-block">CTO</span>
                <span className="work d-block"></span>

                <div className="mt-4">
                  <button href="#" className="v-profile btn btn-md btn-grad">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team bg-black p-3 text-center box">
                <img
                  className="img-responsive rounded-circle"
                  src={team4}
                  width={90}
                />
                <h5 className="mt-3 name">Dominic Titus</h5>
                <span className="work d-block">Advisor</span>
                <span className="work d-block"></span>

                <div className="mt-4">
                  <button href="#" className="v-profile btn btn-md btn-grad">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-3"></div>
            <div className="col-md-3">
              <div className="team bg-black p-3 text-center box">
                <img
                  className="img-responsive rounded-circle"
                  src={team5}
                  width={90}
                />
                <h5 className="mt-3 name">Theodore Jacob</h5>
                <span className="work d-block">Technical Director</span>
                <span className="work d-block"></span>

                <div className="mt-4">
                  <button href="#" className="v-profile btn btn-md btn-grad">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team bg-black p-3 text-center box">
                <img
                  className="img-responsive rounded-circle"
                  src={team6}
                  width={90}
                />
                <h5 className="mt-3 name">Rachel Bowers</h5>
                <span className="work d-block">COO</span>
                <span className="work d-block"></span>

                <div className="mt-4">
                  <button href="#" className="v-profile btn btn-md btn-grad">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
