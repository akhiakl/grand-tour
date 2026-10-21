"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { City } from "@/lib/trip";

import { ListEditor } from "./list-editor";

/** Every remaining City field, revealed once a stop row is expanded. */
export function StopRowDetails({
  city,
  index,
  onChange,
}: {
  readonly city: City;
  readonly index: number;
  readonly onChange: (patch: Partial<City>) => void;
}) {
  const t = useTranslations("Editor.details");
  return (
    <div className="flex flex-col gap-5 border-t border-line pt-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-lat`}>{t("latitude")}</Label>
          <Input
            id={`stop-${index}-lat`}
            type="number"
            value={city.ll[0]}
            onChange={(e) => onChange({ ll: [Number(e.target.value), city.ll[1]] })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-lng`}>{t("longitude")}</Label>
          <Input
            id={`stop-${index}-lng`}
            type="number"
            value={city.ll[1]}
            onChange={(e) => onChange({ ll: [city.ll[0], Number(e.target.value)] })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-budget-low`}>{t("budgetLow")}</Label>
          <Input
            id={`stop-${index}-budget-low`}
            type="number"
            min={0}
            value={city.budget[0]}
            onChange={(e) =>
              onChange({ budget: [Number(e.target.value), city.budget[1]] })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-budget-high`}>{t("budgetHigh")}</Label>
          <Input
            id={`stop-${index}-budget-high`}
            type="number"
            min={0}
            value={city.budget[1]}
            onChange={(e) =>
              onChange({ budget: [city.budget[0], Number(e.target.value)] })
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`stop-${index}-why`}>{t("why")}</Label>
        <Textarea
          id={`stop-${index}-why`}
          maxLength={500}
          value={city.why}
          onChange={(e) => onChange({ why: e.target.value })}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-transport`}>{t("transport")}</Label>
          <Input
            id={`stop-${index}-transport`}
            maxLength={120}
            value={city.transport}
            onChange={(e) => onChange({ transport: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-stay`}>{t("stay")}</Label>
          <Textarea
            id={`stop-${index}-stay`}
            maxLength={300}
            value={city.stay}
            onChange={(e) => onChange({ stay: e.target.value })}
          />
        </div>
      </div>

      <ListEditor
        label={t("must")}
        items={city.must}
        max={10}
        newItem={() => ""}
        onChange={(must) => onChange({ must })}
        renderRow={(item, change) => (
          <Input
            value={item}
            maxLength={80}
            onChange={(e) => change(e.target.value)}
          />
        )}
      />

      <ListEditor
        label={t("gems")}
        items={city.gems}
        max={6}
        newItem={() => ""}
        onChange={(gems) => onChange({ gems })}
        renderRow={(item, change) => (
          <Input
            value={item}
            maxLength={80}
            onChange={(e) => change(e.target.value)}
          />
        )}
      />

      <ListEditor
        label={t("food")}
        items={city.food}
        max={6}
        addLabel={t("addDish")}
        newItem={() => ["", ""] as [string, string]}
        onChange={(food) => onChange({ food })}
        renderRow={([dish, note], change) => (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={dish}
              maxLength={60}
              placeholder={t("dish")}
              onChange={(e) => change([e.target.value, note])}
            />
            <Input
              value={note}
              maxLength={120}
              placeholder={t("dishWhere")}
              onChange={(e) => change([dish, e.target.value])}
            />
          </div>
        )}
      />

      <ListEditor
        label={t("days")}
        items={city.days}
        max={10}
        addLabel={t("addDay")}
        newItem={() => [t("newDay"), "", ""] as [string, string, string]}
        onChange={(days) => onChange({ days })}
        renderRow={([day, title, description], change) => (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={day}
                maxLength={20}
                placeholder={t("dayPlaceholder")}
                className="w-24"
                onChange={(e) => change([e.target.value, title, description])}
              />
              <Input
                value={title}
                maxLength={60}
                placeholder={t("dayTitlePlaceholder")}
                onChange={(e) => change([day, e.target.value, description])}
              />
            </div>
            <Textarea
              value={description}
              maxLength={300}
              placeholder={t("dayBodyPlaceholder")}
              onChange={(e) => change([day, title, e.target.value])}
            />
          </div>
        )}
      />

      <ListEditor
        label={t("tips")}
        items={city.tips}
        max={6}
        newItem={() => ""}
        onChange={(tips) => onChange({ tips })}
        renderRow={(item, change) => (
          <Input
            value={item}
            maxLength={200}
            onChange={(e) => change(e.target.value)}
          />
        )}
      />
    </div>
  );
}
