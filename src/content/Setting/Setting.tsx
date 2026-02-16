import { useState, useEffect } from "react";
import "./Setting.css";
import SettingInfoModal from "./SettingInfoModal/SettingInfoModal";
import InfoSquareIcon from "../Icons/InfoSquareIcon";
import DiscordIcon from "../Icons/DiscordIcon";
import ExtensionStorage from "../../objects/ExtensionStorage";
import Schedule from "../../objects/Schedule";

const autoFillInfo = (
  <div>
    <p>
      Auto-fill automatically selects the &quot;Start Date within&quot; and
      &quot;Academic Level&quot; options in the &quot;Find Course Sections&quot;
      popup.
    </p>
    <br />
    <p>
      The extension will apply these selections to both terms in the currently
      selected session, and only for Undergraduate.
    </p>
  </div>
);

const conflictAddingInfo = (
  <div>
    <p>
      Enabling this option allows you to add sections that conflict with your
      existing schedule. This also applies when importing external schedules or
      copying from saved schedules.
    </p>
    <br />
    <p>
      Warning: Conflicting sections can make your calendar harder to read and
      may increase storage usage. Use this option with care.
    </p>
  </div>
);

const batchImportExportInfo = (
  <div>
    <p>
      Batch import and export allows you to import and export the entire
      schedule across all sessions.
    </p>
    <br />
    <p>
      Warning: Batch import will overwrite any and all existing schedules, use
      this as a backup functionality.
    </p>
  </div>
);

interface IProps {
  schedule: Schedule;
  setSchedule: (schedule: Schedule) => void;
}

const Setting = ({ schedule, setSchedule }: IProps) => {
  const [showInfoModal, setShowInfoModal] = useState<JSX.Element | null>(null);
  const [isAutoFill, setIsAutoFill] = useState(false);
  const [isConflictAdding, setIsConflictAdding] = useState(false);

  useEffect(() => {
    ExtensionStorage.getIsAutoFillEnabled().then(setIsAutoFill);
    ExtensionStorage.getIsConflictAddingEnabled().then(setIsConflictAdding);
  }, []);

  const toggleAutoFill = (checked: boolean) => {
    setIsAutoFill(checked);
    ExtensionStorage.setIsAutoFillEnabled(checked);
  };

  const toggleConflictAdding = (checked: boolean) => {
    setIsConflictAdding(checked);
    ExtensionStorage.setIsConflictAddingEnabled(checked);
  };

  return (
    <div className="setting-container">
      {showInfoModal && (
        <SettingInfoModal
          onClose={() => {
            setShowInfoModal(null);
          }}
          content={showInfoModal}
        />
      )}

      <div className="setting-row">
        <div className="setting-label-group">
          <label className="setting-label">Auto-fill</label>
          <InfoSquareIcon
            size={16}
            onClick={() => {
              setShowInfoModal(autoFillInfo);
            }}
          />
        </div>
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={isAutoFill}
            onChange={(e) => toggleAutoFill(e.target.checked)}
          />
          <span className="setting-slider"></span>
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-label-group">
          <label className="setting-label">Conflict Adding</label>
          <InfoSquareIcon
            size={16}
            onClick={() => {
              setShowInfoModal(conflictAddingInfo);
            }}
          />
        </div>
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={isConflictAdding}
            onChange={(e) => toggleConflictAdding(e.target.checked)}
          />
          <span className="setting-slider"></span>
        </label>
      </div>

      <div
        className="setting-row"
        style={{ borderBottom: "none", paddingBottom: 0 }}
      >
        <a
          href="https://discord.gg/CQQdZTc4xZ"
          target="_blank"
          rel="noreferrer"
          className="setting-btn-discord"
        >
          <DiscordIcon size={20} />
          Join our Discord
        </a>
      </div>

      <div
        className="setting-row"
        style={{
          borderBottom: "none",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <div className="setting-label-group">
          <label className="setting-label">Batch Export/Import</label>
          <InfoSquareIcon
            size={16}
            onClick={() => {
              setShowInfoModal(batchImportExportInfo);
            }}
          />
        </div>
        <div className="setting-btn-group">
          <label className="setting-btn-import" htmlFor="batch-import-file">
            <input
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  const newSchedule =
                    await schedule.getScheduleFromExternalJSON(text);
                  setSchedule(newSchedule);
                } catch (error) {
                  if (error instanceof Error) {
                    alert(error.message);
                  }
                }
                e.target.value = "";
              }}
              style={{ display: "none" }}
              id="batch-import-file"
            />
            Import All
          </label>

          <button
            className="setting-btn-export"
            onClick={() => {
              schedule.downloadScheduleAsJSON();
            }}
          >
            Export All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
