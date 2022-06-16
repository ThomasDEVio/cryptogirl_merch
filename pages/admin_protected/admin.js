import prisma from '../../components/prisma'
import parse from 'html-react-parser';
import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ClientOnly } from '../points';

const adminConnected = atomWithStorage('adminConnected', false);
export default function Admin(props){
  const [ca8719dbca8719db, ca871f9dbca8719db] = useAtom(adminConnected);

    function Table(){
        let arrayFromTable = JSON.parse(props.tabledata)
        let stringTableHTML = "<div className='tableContainer'><table className='adminTable'>";
        stringTableHTML = stringTableHTML + "<tr><th>Wallet</th><th>Register Date</th><th>Points</th></tr>";

        arrayFromTable.forEach(user => {
            var date = new Date(parseInt(user.date));
            let humanDate = date.toLocaleString();

            stringTableHTML = stringTableHTML + "<tr>";
            stringTableHTML = stringTableHTML + "<td>"+user.wallet+"</td>";
            stringTableHTML = stringTableHTML + "<td>"+humanDate+"</td>";
            stringTableHTML = stringTableHTML + "<td>"+user.points+"</td>";
            stringTableHTML = stringTableHTML + "</tr>";
        });

        stringTableHTML = stringTableHTML + "</table></div>"
        return parse(stringTableHTML);
    }


    function Orders(){
        let arrayFromTable = JSON.parse(props.ordersdata)
        let stringTableHTML = "<div className='tableContainer'><table className='adminTable'>";
        stringTableHTML = stringTableHTML + "<tr><th>User Info</th><th>Order Info</th></tr>";

        arrayFromTable.forEach(user => {

            stringTableHTML = stringTableHTML + "<tr>";
            stringTableHTML = stringTableHTML + "<td>"+user.user_info+"</td>";
            stringTableHTML = stringTableHTML + "<td>"+user.order_info+"</td>";
            stringTableHTML = stringTableHTML + "</tr>";
        });

        stringTableHTML = stringTableHTML + "</table></div>"
        return parse(stringTableHTML);
    }

    function ChangePoints(){

        async function handleSubmit(event){
            event.preventDefault();
            try {
                const data = {
                    wallet: event.target.wallet.value,
                    new_points: event.target.new_points.value,
                }
                const JSONdata = JSON.stringify(data)
                const endpoint = '/api/modify_points'
                const options = {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSONdata,
                }
                const response = await fetch(endpoint, options)
                const result = await response.json()
                if(result.response == "failed" || result.response == "error"){
                    alert('Failed to modify, maybe wrong wallet address')
                }else{
                    window.location.reload();
                }
            } catch (error) {
                alert('Error updating points')
                console.log(error)
            }
        }

        return (
            <form onSubmit={handleSubmit}>
                <label className="pragmatica admin_heading">Modify points </label><br/>
                <input type='text' placeholder='Enter wallet' name='wallet' required/>
                <input type='number' placeholder='New points' name='new_points' min='0' step="0.000001" required/>
                <button type='submit'>Update</button>
            </form>
        );
    }

    function Revenue(){
        async function handleRevenue(event){
            event.preventDefault();
            
            fetch('/secret_api_total_revenue?revenueTotal='+event.target.total_revenue.value)
            .then(()=>{
                alert('Updating points, please wait and do not press "Distribute points" again till next month!')
                window.location.reload();
            })

        }

        return (
            <form onSubmit={handleRevenue}>
                <label>Total revenue from secondary sales: </label><br/>
                <input type='number' placeholder='Enter total revenue' name='total_revenue' min='0' required/>
                <button type='submit'>Distribute points</button>
            </form>
        )
    }

    function ConnectedAdmin(){
        return (
            <>
                <h1 className="pragmatica admin_heading">Admin page</h1>
                <p className='text-center'>Please do not modify points after entering total revenue and distributing points!</p>
                <Table/>
                <ChangePoints/>
                <h2 className="pragmatica admin_heading">Revenue</h2>
                <Revenue />
                <h2 className="pragmatica admin_heading">Orders</h2>
                <Orders/>
                <button onClick={()=> ca871f9dbca8719db(false)}>Log Out</button>
            </>
        )
    }
    function NotConnectedAdmin(){
        function connectAdmin(event){
            if(event.target.ca8719dbca8719db.value == "3c4ca8719db4"){
                ca871f9dbca8719db(true)
            }else{
                alert('wrong password!')
            }
        }
        return (
            <>  <h2 className="pragmatica admin_heading">Enter password</h2>
                <form onSubmit={connectAdmin} className='login_form_admin' method='post'>
                    <input type='password' name='ca8719dbca8719db' />
                    <button type="submit">log in</button>
                </form>
            </>
        )
    }
  return (
      <div className="admin_page_container">

        <ClientOnly>
          {ca8719dbca8719db ? <ConnectedAdmin /> : <NotConnectedAdmin />}
        </ClientOnly>
      </div>
  )
}

export async function getServerSideProps(context) {
    BigInt.prototype.toJSON = function() {       
        return this.toString()
      }
    const wholeTable = await prisma.user_wallet.findMany()
    let data = JSON.stringify(wholeTable)

    const orders = await prisma.orders.findMany()
    let orders_data = JSON.stringify(orders)
    
    return {
      props: {tabledata: data , ordersdata: orders_data}, // will be passed to the page component as props
    }
  }
