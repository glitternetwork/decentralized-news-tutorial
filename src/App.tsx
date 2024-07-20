import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import arrowLeft from "./assets/img/arrow-left.png"
import emptyPng from "./assets/img/empty.png";
import arrowRight from "./assets/img/arrow-right.png"
import arrowRightDisable from "./assets/img/arrow-right-disable.png"
import './App.less';
import { assembleSql, dbClient, processDataModal } from './utils/db';
import PageLoading from './components/PageLoading';


interface INewsItem {
  _id: string,
  title: string,
  size: number,
  content: string,
  image: string,
  children: any[],
}

function transDate(dateString: string | undefined) {
  if (!dateString) return null;
  const date = new Date(dateString);

  if (!isNaN(date.getTime())) {
    return date;
  } else {
    console.error("error");
    return null
  }
}

function Index() {
  const today = new Date();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const d = searchParams.get('d') || ''
  const [newsList, setNewsList] = useState<{ [key: string]: INewsItem[] }>({});
  const [, setActiveKey] = useState([]);
  const [date, setDate] = useState(transDate(d) || today);
  const [loading, setLoading] = useState(false);

  const getDay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}.${month}.${day}`
  }

  function getDayTimestampsFromDate(date: any) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const startOfDayTimestamp = dateStart.getTime() / 1000 - 3600;
    const dateEnd = new Date(date);
    dateEnd.setHours(24, 0, 0, 0);
    const endOfDayTimestamp = dateEnd.getTime() / 1000;

    return {
      startOfDayTimestamp,
      endOfDayTimestamp,
    };
  }


  const getNewsByTime = async (dateParams: Date) => {
    try {
      if (loading) return;
      const currentDate = getDay(dateParams)
      if (newsList[currentDate] && newsList[currentDate].length > 0) return;
      if (currentDate === getDay(date)) {
        setLoading(true);
      }
      const { startOfDayTimestamp, endOfDayTimestamp } = getDayTimestampsFromDate(dateParams);
      const { result }: any = await dbClient.query(assembleSql(startOfDayTimestamp.toString(), endOfDayTimestamp.toString()));
      const arr = processDataModal(result);
      if (!newsList[currentDate]) {
        setNewsList((pre) => {
          return { ...pre, [currentDate]: arr }
        });
      }
      setLoading(false);
    } catch (e: any) {
      if (e.code !== 'ERR_CANCELED') {
        setLoading(false);
      }
      console.error(e);
    }

  }

  const formatDate = (date: any) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const prevDay = () => {
    const temp = new Date(date.getTime() - 24 * 60 * 60 * 1000)
    const year = temp.getFullYear();
    const month = (temp.getMonth() + 1).toString().padStart(2, '0');
    const day = temp.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    requestAnimationFrame(() => {
      searchParams.set('d', formattedDate);
      setSearchParams(searchParams);
    })
    setDate(temp);
  };

  const filterHour = (date: any) => {
    return date.toISOString().split('T')[0];
  };

  function canClickTomorrow(dateInput: Date) {
    const today = new Date();
    const userDate = new Date(dateInput);

    today.setHours(0, 0, 0, 0);

    userDate.setDate(userDate.getDate() + 1);
    userDate.setHours(0, 0, 0, 0);

    return userDate <= today;
  }

  const nextDay =  () => {
    const temp = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    if (canClickTomorrow(date)) {
      const year = temp.getFullYear();
      const month = (temp.getMonth() + 1).toString().padStart(2, '0');
      const day = temp.getDate().toString().padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;
      requestAnimationFrame(() => {
        searchParams.set('d', formattedDate);
        setSearchParams(searchParams);
      })
      setDate(temp);
    }
  };

  const fetchNews = async () => {
    try {
      const currentDate = getDay(date);
      if (newsList[currentDate] && newsList[currentDate].length > 0) {
        return;
      } else {
        setLoading(true)
      }
      await getNewsByTime(date);
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        setLoading(false);
      }
      console.error('Fetching news failed:', error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setActiveKey([]);
    fetchNews();

    return () => {
      controller.abort();
    };
  }, [date]);




  const handlePanelClick = (id: string) => {
    navigate(`/detail/${id}`)
  }

  return (
    <>
      {loading && <PageLoading loading={loading} />}
      <div className='open-news-container'>
        <h1>Decentralized News Source</h1>
        <section className='result-list'>
          <div className='time-range'>
            <span className='time-btn'>
              <img onClick={() => prevDay()} src={arrowLeft} alt="" />
            </span>
            <p>{formatDate(date)}</p>
            <span className='time-btn'>
              <img onClick={() => nextDay()} src={filterHour(date) === filterHour(today) ? arrowRightDisable : arrowRight} alt="" />
            </span>
          </div>

          <div>
            {newsList[getDay(date)] && newsList[getDay(date)].length > 0 ? newsList[getDay(date)].map((i: INewsItem) => (
              <div onClick={() => handlePanelClick(i._id)} className='panel-box' key={i._id}>{i.title}</div>
            )) :
              !loading && <div className='empty-box' style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <img width={56} height={56} src={emptyPng} alt="" />
                There were no events on this day.
              </div>
            }
          </div>
        </section>
        <div className='end-line'>
          <div className='width-80-line'></div> END <div className='width-80-line'></div>
        </div>
      </div >
    </>
  );
}

export default Index;
