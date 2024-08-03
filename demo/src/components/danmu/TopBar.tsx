import { useTranslation } from 'react-i18next';
import githubLogo from '@/assets/github.svg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TopBar() {
  const { t, i18n } = useTranslation();

  return (
    <div className="relative">
      <a
        className="block w-[30px]"
        target="_blank"
        href="https://github.com/imtaotao/danmu"
      >
        <img
          src={githubLogo}
          alt="github logo"
          className="w-[30px] h-[30px] absolute z-10 right-1"
        />
      </a>
      <Select onValueChange={(e) => i18n.changeLanguage(e)}>
        <SelectTrigger className="absolute w-[100px] h-[30px] z-10 right-[45px]">
          <SelectValue
            placeholder={t('language')}
            defaultValue={i18n.language}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh">简体中文</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
