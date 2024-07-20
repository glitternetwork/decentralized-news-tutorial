import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import back from "../../assets/img/back.png"
import './index.less';
import { assembleClusterByID, assembleDetailSql, processDataModal, dbClient, searchSource } from '../../utils/db';
import PageLoading from '../../components/PageLoading';
import { filterSameArr } from '../../utils';
import emptyPng from "../../assets/img/empty-default.png";


function DetailPage() {
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState<any>()
    const [list, setList] = useState<any>([]);
    const [tags, setTags] = useState<any>({});

    const getNewsTag = async () => {
        const { result }: any = await dbClient.query(searchSource());
        const data = processDataModal(result);
        const idToNameMap = data.reduce((accumulator, { _id, name }) => {
            accumulator[_id] = name;
            return accumulator;
        }, {});
        setTags(idToNameMap)
    }


    const getClusterById = async () => {
        const { result }: any = await dbClient.query(assembleClusterByID(id || ''));
        const data = processDataModal(result);
        setInfo(data[0]);
    }

    const getNewsById = async () => {
        const { result }: any = await dbClient.query(assembleDetailSql(id || ''));
        const data = processDataModal(result);
        const temp = filterSameArr(data);
        setList(temp);
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([getClusterById(), getNewsById()]).finally(() => {
            setLoading(false);
        })
        getNewsTag();
    }, [])

    const handleBack = () => {
        if (window.history.state && window.history.state.idx !== 0) {
            navigate(-1)
        } else {
            navigate('/')
        }

    }






    return (
        <>
            {!loading ? <div className='detail-container'>
                <header className='detail-header'>
                    <div className='back-btn'>
                        <img onClick={handleBack} width={20} height={14} src={back} alt="" />
                    </div>
                    <p className='detail-paragraph'>{info?.title}</p>
                </header>

                <section className='detail-news'>


                    <p>
                        <span>{list.length || 0} news</span> about this event
                    </p>
                    <div className='news-lists'>
                        {list.map((i: any) => (
                            <a href={i._id} target='blank' className='news-item' key={i._id} >
                                {i.image && <img className='web-img' onError={(e: any) => {
                                    e.target.src = emptyPng;
                                }} width={200} height={150} src={i.image} alt="" />}
                                <div>
                                    <h3>{i.title}</h3>
                                    <div className='news-content'>
                                        <p>{i.content}</p>

                                    </div>
                                    {
                                        tags[i.source] && <div className='news-tags'>
                                            <span>{tags[i.source]}</span>
                                        </div>
                                    }
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className='end-line'>
                        <div className='width-80-line'></div> END <div className='width-80-line'></div>
                    </div>
                </section>
            </div > : <PageLoading loading={loading}></PageLoading>
            }
        </>
    );
}

export default DetailPage;
