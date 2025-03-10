import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import "./WorkBoardDetail.css";


const WorkBoardDetail = () => {
    const { id } = useParams(); // URL 파라미터에서 id 가져오기
    const [eventDetail, setEventDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const [error, setError] = useState(null);
    const areaCd = query.get("areaCd");
    console.log("🔍 areaCd:", areaCd); // 값 확인

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                console.log("areaCd:", areaCd);

                const response = await axios.get("http://localhost:8090/api/work/board/detail", {
                    params: { eventNo: id, areaCd: areaCd }, // API에 eventNo 전달
                });

                console.log("API 응답 데이터:", response.data);

                console.log("API 호출 파라미터:", { eventNo: id, areaCd: areaCd }); // params 확인
                console.log("API 호출 URL:", response.config.url); // 호출된 URL 확인

                // 상태 업데이트
                setEventDetail(response.data); // JSON 응답을 그대로 상태에 저장

            } catch (err) {
                console.error("❌ 데이터 불러오기 오류:", err);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetail();
    }, [id, areaCd]); // id가 변경될 때마다 호출

    if (loading) return <p>데이터 로딩 중...</p>;
    if (error) return <p>{error}</p>;
    
    if (!eventDetail) return <p>데이터가 없습니다.</p>;

    return (
        <div className="workdetail-container mx-auto p-4">
            <h1 className="workdetail-title">{eventDetail.title}</h1>
            
            <div className="workdetail-section">
                <p className="workdetail-paragraph"><strong className="workdetail-strong">기간:</strong> {eventDetail.eventTerm}</p>
                <p className="workdetail-paragraph"><strong className="workdetail-strong">장소:</strong> {eventDetail.eventPlc} {/*<a href="#" className="workdetail-link">지도보기</a>*/}</p>
                {/*지도보기 사용하려면 추가api연동이 필요 시간관계상 스킵*/}
            </div>
            
            <div className="workdetail-section">
                <p className="workdetail-paragraph"><strong className="workdetail-strong">참여 기업:</strong></p>
                <ul className="workdetail-list">
                    <li className="workdetail-list-item">{eventDetail.joinCoWantedInfo}</li>
                </ul>
            </div>
        
            <div className="workdetail-section">
                <p className="workdetail-paragraph"><strong className="workdetail-strong">부대사항:</strong> {eventDetail.subMatter}</p>
                <p className="workdetail-paragraph"><strong className="workdetail-strong">문의 전화:</strong> {eventDetail.inqTelNo}</p>
                <p className="workdetail-paragraph"><strong className="workdetail-strong">팩스:</strong> {eventDetail.fax}</p>
                <p className="workdetail-paragraph"><strong className="workdetail-strong">담당자:</strong> {eventDetail.charger}</p>
                <p className="workdetail-paragraph"><strong className="workdetail-strong">이메일:</strong> {eventDetail.email}</p>
                <p className="workdetail-paragraph"><strong className="workdetail-strong">오시는 길:</strong> {eventDetail.visitPath}</p>
                {/* <p className="workdetail-paragraph"><strong className="workdetail-strong">지역 코드:</strong> {areaCd}</p> */}
            </div>
            
            {/* <img src="path/to/your/image.jpg" alt="Event" className="workdetail-image" /> 이미지 추가 */}
        </div>
    );
    
    
    
    
};

export default WorkBoardDetail;
