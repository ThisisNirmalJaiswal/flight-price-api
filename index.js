const express = require('express');
const path = require('path');
const ejs = require('ejs');
const app = express();
const axios = require('axios')
require('dotenv').config();


app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3500;
const API_KEY = process.env.API_KEY;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')


app.get('/', async(req, res) => {
     res.render('index');
  });


const getFlights = async (originCity, destinationCity, date) => {
  const options = {
    method: 'GET',
    url: 'https://priceline-com-provider.p.rapidapi.com/v2/flight/departures',
    params: {
      adults: '1',
      sid: 'iSiX639',
      departure_date: date,
      origin_airport_code: originCity,
      destination_airport_code: destinationCity,

    },
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'priceline-com-provider.p.rapidapi.com'
    }
  };
  try {
    const response = await axios.request(options);
    const flights = response.data.getAirFlightDepartures.results.result;
    // console.log(flights.itinerary_data);
    let itinerary = flights.itinerary_data;
    // console.log(itinerary)
    let data = Object.values(itinerary);
    // console.log(data)
    let prices = {};
    data.forEach( e=>{
      prices[e.slice_data.slice_0.airline.name] = `₹${e.price_details.display_total_fare * 81.81}`.slice(0,9)
    })
    return prices;
  } catch (error) {
    console.log(error)
}};

// flight api for check price between source to destination
  app.post('/flights',async(req,res)=>{
    try{
        // destructuring the body data 
      let {source, destination, date} = req.body;
    
    // in case of lower case input
      source = source.toUpperCase();
      destination = destination.toUpperCase();

    //   logging the body data
      console.log(req.body)

    //   calling the getFlights for fetch the data from api
        let flights = await getFlights(source, destination, date)

        
        return res.status(200).send({status:true, data:flights})
    }catch(e){
         res.status(500).send({status:false, message:e.message})
    }
  });
  

  app.all('*', (req, res) => {
   res.status(404).send("ERROR: 404 Not found!")
  });

  app.listen(PORT, () => {
    console.log(`serving at http://localhost:${PORT}`);
  });
