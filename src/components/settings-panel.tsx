"use client";

import { ArrowRight, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { IntegrationForm } from "@/components/integrations/integration-form";
import { Button } from "@/components/ui/button";
import { useUserConfig } from "@/hooks/use-user-config";

type View = "daily" | "integrations" | "guide";
interface SettingsPanelProps {
  onNavigate?: (view: View) => void;
  onResetPreferences?: () => void;
}

export function SettingsPanel({ onNavigate, onResetPreferences }: SettingsPanelProps) {
  const { isHydrated } = useUserConfig();
  if (!isHydrated)
    return (
      <p role="status" className="field-help">
        Carregando preferências…
      </p>
    );
  return <SettingsContent onNavigate={onNavigate} onResetPreferences={onResetPreferences} />;
}

function SettingsContent({ onNavigate, onResetPreferences }: SettingsPanelProps) {
  const { config, updateConfig, clearCredentials, persistenceAvailable } = useUserConfig();
  const [remember, setRemember] = useState(config.rememberCredentials);
  const [clearVersion, setClearVersion] = useState(0);
  const [confirmation, setConfirmation] = useState<"credentials" | "preferences" | null>(null);
  const [notice, setNotice] = useState("");

  function confirmReset() {
    if (confirmation === "credentials") {
      clearCredentials();
      setClearVersion((version) => version + 1);
      setRemember(false);
      setNotice(
        "Credenciais removidas. A identificação das integrações e seu rascunho foram preservados."
      );
    } else {
      updateConfig({ defaultMode: "combined-auto" });
      onResetPreferences?.();
      setNotice(
        "Período de 24 horas e formato Daily Scrum restaurados, instruções adicionais limpas e fontes disponíveis selecionadas. Integrações e rascunho preservados."
      );
    }
    setConfirmation(null);
  }

  return (
    <div className="narrow-view">
      <div className="page-heading">
        <div>
          <h1 id="integrations-heading" tabIndex={-1}>
            Suas fontes de trabalho.
          </h1>
          <p>Configure uma integração por vez. O rascunho continua onde você o deixou.</p>
        </div>
      </div>
      <IntegrationForm
        provider="azure"
        config={config}
        onSave={updateConfig}
        clearVersion={clearVersion}
        persistenceAvailable={persistenceAvailable}
      />
      <IntegrationForm
        provider="optsolv"
        config={config}
        onSave={updateConfig}
        clearVersion={clearVersion}
        persistenceAvailable={persistenceAvailable}
      />
      <section className="storage-note" aria-labelledby="storage-heading">
        <ShieldCheck aria-hidden="true" />
        <div>
          <h2 id="storage-heading">Você escolhe onde guardar as credenciais.</h2>
          <p>
            Por padrão, tokens ficam apenas na sessão deste navegador. Organização, projeto, filtros
            e preferências são lembrados no dispositivo quando o armazenamento está disponível.
          </p>
          <p>Recarregar ou fechar a página descarta os tokens que não foram lembrados.</p>
          {persistenceAvailable ? null : (
            <p className="field-error" role="status">
              Armazenamento indisponível. Configurações mantidas somente nesta sessão.
            </p>
          )}
          <div className="storage-controls">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                aria-describedby="remember-help"
              />{" "}
              Lembrar credenciais neste dispositivo
            </label>
            <p id="remember-help" className="field-help">
              Ao ativar e salvar, os tokens ficam no armazenamento local, sem criptografia. Evite
              esta opção em dispositivos compartilhados.
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={remember === config.rememberCredentials}
              onClick={() => {
                updateConfig({ rememberCredentials: remember });
                setNotice(
                  remember
                    ? "Escolha de armazenamento aplicada."
                    : "Credenciais retidas somente na sessão atual."
                );
              }}
            >
              Salvar escolha de armazenamento
            </Button>
          </div>
          <p>
            As credenciais passam pelas rotas de API da aplicação para consultar suas fontes. Os
            registros selecionados e suas instruções são enviados ao provedor de IA.
          </p>
          {onNavigate ? (
            <Button
              type="button"
              variant="link"
              className="text-link"
              onClick={() => onNavigate("guide")}
            >
              Entender o fluxo de dados <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </section>
      <section className="destructive-actions" aria-labelledby="reset-heading">
        <h2 id="reset-heading">Gerenciar dados deste dispositivo</h2>
        <p className="field-help">
          Remova tokens ou restaure as preferências de geração. Seu rascunho permanece disponível.
        </p>
        <div className="connection-actions">
          <Button type="button" variant="outline" onClick={() => setConfirmation("credentials")}>
            <Trash2 aria-hidden="true" />
            Remover credenciais
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirmation("preferences")}>
            Restaurar preferências
          </Button>
        </div>
        {confirmation ? (
          <fieldset className="inline-confirmation" aria-label="Confirmar limpeza">
            <p>
              {confirmation === "credentials"
                ? "Remover os tokens salvos e os tokens preenchidos ainda não salvos? Será necessário informá-los novamente."
                : "Restaurar o período de 24 horas e o formato Daily Scrum, limpar instruções adicionais e selecionar as fontes disponíveis?"}
            </p>
            <div className="connection-actions">
              <Button type="button" variant="destructive" onClick={confirmReset}>
                Confirmar {confirmation === "credentials" ? "remoção" : "restauração"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>
                Cancelar
              </Button>
            </div>
          </fieldset>
        ) : null}
        <p className="field-help" role="status" aria-live="polite">
          {notice}
        </p>
      </section>
      {onNavigate ? (
        <Button
          type="button"
          variant="link"
          className="text-link"
          onClick={() => onNavigate("daily")}
        >
          Voltar ao rascunho <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
