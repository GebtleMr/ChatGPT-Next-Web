import { useState } from "react";

import styles from "../components/settings.module.scss";

import CloseIcon from "../icons/close.svg";
import EditIcon from "../icons/edit.svg";
import SendWhiteIcon from "../icons/send-white.svg";

import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showToast,
} from "../components/ui-lib";

import { IconButton } from "../components/button";

import Locale from "../locales";
import Link from "next/link";
import { Path, UPDATE_URL } from "../constant";
import { ErrorBoundary } from "../components/error";
import { InputRange } from "../components/input-range";
import { useNavigate } from "react-router-dom";

import zBotServiceClient, {
  UserCheckResultVO,
  UserRegisterVO,
} from "../zbotservice/ZBotServiceClient";
import { sendVerifyCode } from "./user-verifyCode";

const registerCheck = async (userRegisterVO: UserRegisterVO) => {
  console.log("register checking: userRegisterVO= ", userRegisterVO);

  if (userRegisterVO.email.trim().length === 0) {
    showToast("邮箱不可为空");
    return;
  } else if (userRegisterVO.nickName.trim().length === 0) {
    showToast("昵称不可为空");
    return;
  } else if (userRegisterVO.password.trim().length === 0) {
    showToast("邮箱验证码不可为空");
    return;
  } else if (userRegisterVO.password.trim().length === 0) {
    showToast("密码不可为空");
    return;
  } else if (userRegisterVO.occupation.trim().length === 0) {
    showToast("职业不可为空");
    return;
  }

  // register to db
  try {
    const result = await zBotServiceClient.register(userRegisterVO);
    console.log(`register check result: `, result);

    if (result === UserCheckResultVO.success) {
      showToast("注册成功, 请返回登录");
    } else if (result === UserCheckResultVO.emailConflict) {
      showToast("该邮箱已被注册, 请重新输入");
    } else if (result === UserCheckResultVO.emailInvalid) {
      showToast("该邮箱格式不正确, 请重新输入");
    } else if (result === UserCheckResultVO.verifyCodeInvalid) {
      showToast("验证码不正确, 请重新输入");
    } else {
      showToast("注册失败, 请重新输入");
    }
  } catch (error) {
    console.log("db access failed:", error);
  }
};

export function UserRegister() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickName, setNickName] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [inviterEmail, setInviterEmail] = useState("");

  var userRegisterVO: UserRegisterVO = {
    email: userEmail,
    password: password,
    nickName: nickName,
    occupation: occupation,
    inviterEmail: inviterEmail,
    verifyCode: Number(verifyCode),
  };

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">{"用户信息"}</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem
            title="邮箱*"
            subTitle="-邮箱仅用来区分用户, 不会访问个人信息"
          >
            <input
              type="text"
              name="useremail"
              placeholder="邮箱不可重复"
              onChange={(e) => setUserEmail(e.target.value)}
            ></input>
          </ListItem>
          <ListItem title={"邮箱验证码*"}>
            <input
              type="text"
              name="phonecode"
              placeholder="验证码"
              onChange={(e) => setVerifyCode(e.target.value)}
            ></input>
            <IconButton
              icon={<EditIcon />}
              text={"发送验证码"}
              onClick={() => sendVerifyCode(userEmail)}
            />
          </ListItem>
          <ListItem title="昵称*">
            <input
              type="text"
              name="username"
              placeholder="昵称"
              onChange={(e) => setNickName(e.target.value)}
            ></input>
          </ListItem>
          <ListItem title="密码*" subTitle="-请尽量避免使用其他账号的密码">
            <input
              type="password"
              name="password"
              placeholder="字母、数字或下划线组成"
              onChange={(e) => setPassword(e.target.value)}
            />
          </ListItem>
          <ListItem title={"职业*"}>
            <input
              type="text"
              name="occupation"
              placeholder="职业"
              onChange={(e) => setOccupation(e.target.value)}
            />
          </ListItem>
          <ListItem title={"邀请人邮箱(可选)"}>
            <input
              type="text"
              name="inviteremail"
              placeholder="xxx@example.com"
              onChange={(e) => setInviterEmail(e.target.value)}
            />
          </ListItem>
        </List>

        <ListItem title="">
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"登录"}
              onClick={() => navigate(Path.UserLogin)}
            />
          }
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"注册"}
              type="primary"
              onClick={() => registerCheck(userRegisterVO)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
