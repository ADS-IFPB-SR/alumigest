package br.edu.ifpb.alumigest.budgets.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "empresa")
public class CompanyProperties {

    private String razaoSocial;
    private String cnpj;
    private String inscricaoEstadual;
    private String telefone;
    private String endereco;
    private String cidadeUf;

    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getInscricaoEstadual() { return inscricaoEstadual; }
    public void setInscricaoEstadual(String inscricaoEstadual) { this.inscricaoEstadual = inscricaoEstadual; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getCidadeUf() { return cidadeUf; }
    public void setCidadeUf(String cidadeUf) { this.cidadeUf = cidadeUf; }
}