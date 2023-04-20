import axios from 'axios';
import React, { useEffect, useState } from 'react';

function List() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/list/')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);
  return (
    <div className="table-responsive buy-history-content">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="text-center">ID</th>
                    <th className="text-center">Address</th>
                    <th className="text-center">Amount</th>
                    <th className="text-center">Package</th>
                    
                  </tr>

                </thead>
                <tbody>
                  {data.map((data, index) => (
                      <tr>
                        <th scope="row" className="text-center">
                          {index + 1}
                        </th>
                        <td className="text-center">
                          {data.wallet_address}
                        </td>
                        <td className="text-center">
                          {data.amount}
                        </td>
                        <td className="text-center">
                            {data.pack}
                        </td>
                        
                        
                        
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
  );
}
export default List;