import {useState,useEffect} from 'react'
function Ranking(){
    const [ranking,setRanking]=useState([])
    useEffect(()=>{
        getRanking()
    },[])
    const getRanking=async()=>{
        const {data,error}=await supabase.from('records').select('*')
        if(error){
            console.log(error)
        }else{
            setRanking(data)
        }
    }
    return(
        <div>
            <div>ランキング</div>
            <div>{ranking}</div>
        </div>
    )
}
export default Ranking;