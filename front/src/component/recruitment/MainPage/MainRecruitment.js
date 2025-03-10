import { Link } from "react-router-dom";
import React from 'react';
import Sidebar from './RecruitmentSidebar'; // Sidebar 컴포넌트 임포트
import "../MainPage/MainRecruitment.css"; // CSS 임포트


function MainRecruitment() {
    return (
        <div className="main-recruitment__container mt-5">
            <Sidebar className="main-recruitment__sidebar-fixed" /> {/* 사이드바 */}
            <div className="main-recruitment__col-md-9"> {/* 중앙 콘텐츠 */}
                {/* 안내 메시지 카드 */}
                <div className="main-recruitment__message-card text-center mb-4">
                    <h1>이미지 클릭 시 해당 게시판으로 이동합니다.</h1>
                </div>

                {/* 카드 박스 부분 */}
                <div className="main-recruitment__row">
                    {[
                        { to: "/SuggestBoard", imgSrc: "/img/bg1.jpg", title: "추천 채용공고" },
                        { to: "/CampusBoard", imgSrc: "/img/bg2.jpg", title: "교내 채용공고" },
                        { to: "/WorkBoard", imgSrc: "/img/bg3.jpg", title: "고용24 채용공고" },
                        { to: "/JobPostingBoard", imgSrc: "/img/win.jpg", title: "외부 채용공고 사이트" },
                    ].map((card, index) => (
                        <div className="main-recruitment__col-md-4" key={index}>
                            <Link to={card.to}>
                                <div className="main-recruitment__card">
                                    <img src={card.imgSrc} className="main-recruitment__card-img-top" alt={card.title} />
                                    <div className="main-recruitment__card-body">
                                        <h5 className="main-recruitment__card-title">{card.title}</h5>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MainRecruitment;
