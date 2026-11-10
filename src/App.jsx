import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [mood, setMood] = useState("lazy");
  const [dayType, setDayType] = useState("any");
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [viewedIds, setViewedIds] = useState([]);
  const [currentMood, setCurrentMood] = useState("");

  const [loading, setLoading]=useState(false);

  const [theme, setTheme]=useState(()=>
  {
    return localStorage.getItem("app-theme") || "light";
  });

  useEffect(()=>{
    if(theme=="dark"){
      document.body.classList.add("dark-theme");
    }else{
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("app-theme", theme);
  },[theme]
);

const toggleTheme=()=>{
  setTheme((prevTheme)=>(prevTheme=="light"? "dark":"light"));
};


  const BACKEND_URL='http://localhost:8080/api/activities/random';


  const fetchActivity = async () => {
   let localViewedIds=viewedIds;

   if(currentMood !=mood){
    localViewedIds=[];
    setViewedIds([]);
    setCurrentMood(mood);
   }

   const params={mood,dayType};
   if(localViewedIds.length>0){
    params.exclude=localViewedIds.join(',');
   }

    try {
      setError('');
      
      const response = await axios.get(BACKEND_URL, {params});

      setActivity(response.data);

      if(!localViewedIds.includes(response.data.id)){
        setViewedIds([...localViewedIds,response.data.id]);
      }

    } catch (err) {
      setActivity(null);
      setViewedIds([]);
      if(err.response && err.response.data){
        setError(err.response.data.message || 'Произошла ошибка бэкэнда');
      }else{
        setError('Не удалось связаться с сервером Spring Boot')
      }
    }
  };



  return (
    <div className="app-container">

      <button className="theme-toggle" onClick={toggleTheme}>{theme==="light"? "🌙":"☀️"}</button>

      <h1>What to do?</h1>

      <div className="filter-group">
        <label>What is your mood?</label>
        <select value={mood} onChange={(e)=>setMood(e.target.value)}>
          <option value="lazy">Lazy state</option>
          <option value="active">Active state</option>
          <option value="social">Social state</option>
          <option value="creative">Creative state</option>
          <option value="angry">Angry state</option>
          <option value="tired">Tired state</option>
          <option value="sick">Sick state</option>
           <option value="broken">Broken state</option>

        </select>
      </div>
      <div className="filter-group">
        <label>What day is it today?</label>
        <select value={dayType} onChange={(e)=>setDayType(e.target.value)}>
          <option value="any">An ordinary day</option>
          <option value="weekend">Weekend</option>
          <option value="workday">Weekday</option>
        </select>
      </div>

      <button className="btn-generate" onClick={fetchActivity}>Surprise me!</button>

      {loading && (
        <div className="spinner-contayner">
          <div className="spinner"></div>
        </div>
      )}


      {activity &&  (
        <div className="result-card" key={activity.id}>
          <div className="result-title">{activity.title}</div>
          <div className="result-desc">{activity.description}</div>
          <div className="badge">{activity.free ? "Free":"Paid"}</div>
        </div>
      )}

      {error &&  <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
