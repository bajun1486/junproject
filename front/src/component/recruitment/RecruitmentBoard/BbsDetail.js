import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import CommentWrite from "../comment/CommentWrite";
import CommentList from "../comment/CommentList";
import FileDisplay from "../file/FileDisplay";

import "../../recruitment/css/bbsdetail.css"; // 스타일 파일 import

function BbsDetail() {
  const [bbs, setBbs] = useState({});
  const { boardId } = useParams(); // 파라미터 가져오기
  const navigate = useNavigate();

  const getBbsDetail = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8989/board/${boardId}`);
      console.log("[BbsDetail.js] getBbsDetail() success :D");
      console.log(response.data);
      setBbs(response.data);
    } catch (error) {
      console.log("[BbsDetail.js] getBbsDetail() error :<");
      console.error(error);
    }
  }, [boardId]); // boardId를 의존성으로 추가

  const deleteBbs = async () => {
    try {
      const headers = {
        "Authorization": `Bearer ${localStorage.getItem("bbs_access_token")}`
      };
      const response = await axios.delete(`http://localhost:8989/board/${boardId}/delete`, { headers });

      console.log("[BbsDetail.js] deleteBbs() success :D");
      console.log(response.data);

      if (response.status === 200) {
        alert("게시글을 성공적으로 삭제했습니다 :D");
        navigate("/bbslist");
      }
    } catch (error) {
      console.log("[BbsDetail.js] deleteBbs() error :<");
      console.error(error);
    }
  };

  useEffect(() => {
    getBbsDetail();
  }, [getBbsDetail]); // getBbsDetail을 의존성 배열에 추가

  const updateBbs = {
    boardId: bbs.boardId,
    writerName: bbs.writerName,
    title: bbs.title,
    content: bbs.content,
    files: bbs.files
  };

  return (
    <div className="bbs-detail-container">
      <div>
        <div className="my-3 d-flex justify-content-end">
          <Link className="btn btn-outline-secondary" to="/bbslist">
            <i className="fas fa-list"></i> 글목록
          </Link> &nbsp;

          {
            (localStorage.getItem("id") === bbs.writerName) ? (
              <>
                <Link className="btn btn-outline-secondary" to="/bbsupdate" state={{ bbs: updateBbs }}>
                  <i className="fas fa-edit"></i> 수정
                </Link> &nbsp;
                <button className="btn btn-outline-danger" onClick={deleteBbs}>
                  <i className="fas fa-trash-alt"></i> 삭제
                </button>
              </>
            ) : null
          }
        </div>

        <table className="table table-striped">
          <tbody>
            <tr>
              <th className="col-3">작성자</th>
              <td><span>{bbs.writerName}</span></td>
            </tr>
            <tr>
              <th>제목</th>
              <td><span>{bbs.title}</span></td>
            </tr>
            <tr>
              <th>작성일</th>
              <td><span>{bbs.createdDate}</span></td>
            </tr>
            <tr>
              <th>조회수</th>
              <td><span>{bbs.viewCount}</span></td>
            </tr>
            <tr>
              <th>내용</th>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="content-box">{bbs.content}</div>
        <div>
          <FileDisplay files={bbs.files} boardId={boardId} />
        </div>

        {/* 댓글 리스트 컴포넌트 */}
        <CommentList boardId={boardId} />

        {/* 댓글 작성 컴포넌트 */}
        {
          (localStorage.getItem("bbs_access_token")) ? // 로그인한 사용자만 댓글 작성 가능
            <CommentWrite boardId={boardId} />
            : null
        }
      </div>
    </div>
  );
}

export default BbsDetail;
